import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { fetchSystemHealthTopology, fetchSystemLogs } from "@/lib/planc-api";
import {
  LinkHealth,
  ModuleHealth,
  SystemHealthSnapshot,
  SystemLogLevel,
  SystemLogsSnapshot,
  SystemSubmodule,
} from "@/lib/system-health";
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  Edge,
  EdgeLabelRenderer,
  EdgeProps,
  Handle,
  MarkerType,
  Node,
  NodeProps,
  Position,
  ReactFlow,
  getSmoothStepPath,
} from "reactflow";
import { useDeferredValue, useEffect, useMemo, useState, type CSSProperties } from "react";
import "reactflow/dist/style.css";
import "./system-health.css";

type ModuleNodeData = {
  title: string;
  stack: string;
  description: string;
  health: ModuleHealth;
  submodules: SystemSubmodule[];
  details?: Record<string, unknown>;
};

type LinkEdgeData = {
  health: LinkHealth;
  note: string;
  laneOffset?: number;
};

const HIDDEN_HANDLE_STYLE: CSSProperties = { opacity: 0, pointerEvents: "none" };

const NODE_HANDLES: Array<{
  id: string;
  type: "source" | "target";
  position: Position;
  style?: CSSProperties;
}> = [
  { id: "in-l-top", type: "target", position: Position.Left, style: { top: "20%" } },
  { id: "in-l-mid", type: "target", position: Position.Left, style: { top: "50%" } },
  { id: "in-l-bottom", type: "target", position: Position.Left, style: { top: "80%" } },
  { id: "in-t-left", type: "target", position: Position.Top, style: { left: "20%" } },
  { id: "in-t-mid", type: "target", position: Position.Top, style: { left: "50%" } },
  { id: "in-t-right", type: "target", position: Position.Top, style: { left: "80%" } },
  { id: "out-r-top", type: "source", position: Position.Right, style: { top: "25%" } },
  { id: "out-r-mid", type: "source", position: Position.Right, style: { top: "50%" } },
  { id: "out-r-bottom", type: "source", position: Position.Right, style: { top: "75%" } },
  { id: "out-b-left", type: "source", position: Position.Bottom, style: { left: "20%" } },
  { id: "out-b-mid", type: "source", position: Position.Bottom, style: { left: "50%" } },
  { id: "out-b-right", type: "source", position: Position.Bottom, style: { left: "80%" } },
  { id: "out-t-left", type: "source", position: Position.Top, style: { left: "20%" } },
  { id: "out-t-mid", type: "source", position: Position.Top, style: { left: "50%" } },
  { id: "out-t-right", type: "source", position: Position.Top, style: { left: "80%" } },
];

const EDGE_ROUTE_MAP: Record<
  string,
  {
    sourceHandle: string;
    targetHandle: string;
    laneOffset: number;
  }
> = {
  "e-core-data": { sourceHandle: "out-r-mid", targetHandle: "in-l-mid", laneOffset: 16 },
  "e-orch-data": { sourceHandle: "out-b-mid", targetHandle: "in-t-mid", laneOffset: 28 },
  "e-data-exec": { sourceHandle: "out-r-mid", targetHandle: "in-l-mid", laneOffset: 16 },
  "e-exec-risk": { sourceHandle: "out-r-top", targetHandle: "in-l-mid", laneOffset: 40 },
  "e-risk-analytics": { sourceHandle: "out-b-mid", targetHandle: "in-t-mid", laneOffset: 24 },
  "e-data-analytics": { sourceHandle: "out-b-right", targetHandle: "in-l-bottom", laneOffset: 48 },
  "e-core-risk": { sourceHandle: "out-t-right", targetHandle: "in-l-top", laneOffset: 72 },
};

function healthText(value: ModuleHealth): string {
  if (value === "healthy") return "Healthy";
  if (value === "warning") return "Warning";
  return "Offline";
}

function ledClass(value: ModuleHealth): string {
  if (value === "healthy") return "module-led module-led-healthy";
  if (value === "warning") return "module-led module-led-warning";
  return "module-led module-led-offline";
}

function logLevelClass(value: SystemLogLevel): string {
  if (value === "ERROR") return "module-log-level module-log-level-error";
  if (value === "WARNING") return "module-log-level module-log-level-warning";
  return "module-log-level module-log-level-info";
}

function formatLogTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString([], { hour12: false });
}

function ModuleNode({ data }: NodeProps<ModuleNodeData>) {
  const detailPairs = Object.entries(data.details ?? {}).slice(0, 2);
  return (
    <div className="module-node" data-health={data.health}>
      {NODE_HANDLES.map((handle) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type={handle.type}
          position={handle.position}
          style={{ ...HIDDEN_HANDLE_STYLE, ...handle.style }}
        />
      ))}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-100">{data.title}</p>
          <p className="text-[11px] text-cyan-200/90 font-mono">{data.stack}</p>
        </div>
        <div className={ledClass(data.health)} title={healthText(data.health)} />
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{data.description}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {data.submodules.map((item) => (
          <span
            key={item.id}
            className="submodule-chip"
            data-health={item.health}
            title={item.detail ?? healthText(item.health)}
          >
            <span className="submodule-dot" data-health={item.health} />
            <span>{item.name}</span>
          </span>
        ))}
      </div>
      {detailPairs.length > 0 ? (
        <div className="mt-2 text-[10px] text-slate-400 space-y-0.5">
          {detailPairs.map(([key, value]) => (
            <p key={key}>
              <span className="text-slate-500">{key}:</span>{" "}
              <span className="font-mono text-slate-300">{String(value)}</span>
            </p>
          ))}
        </div>
      ) : null}
      <div className="mt-2 text-[10px] uppercase tracking-[0.12em] text-slate-500">
        {healthText(data.health)}
      </div>
    </div>
  );
}

function FlowingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<LinkEdgeData>) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
    offset: data?.laneOffset ?? 20,
  });
  const warning = data?.health === "warning";
  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={{
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: warning ? "#facc15" : "#22c55e",
      }}
      className={warning ? "edge-flow-warning" : "edge-flow-healthy"}
    />
  );
}

function BrokenEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<LinkEdgeData>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 14,
    offset: data?.laneOffset ?? 24,
  });
  return (
    <>
      <BaseEdge id={id} path={edgePath} className="edge-broken" />
      <EdgeLabelRenderer>
        <div
          className="edge-broken-x"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          X
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = {
  module: ModuleNode,
};

const edgeTypes = {
  flowing: FlowingEdge,
  broken: BrokenEdge,
};

function toGraph(snapshot: SystemHealthSnapshot): { nodes: Node<ModuleNodeData>[]; edges: Edge<LinkEdgeData>[] } {
  const nodes: Node<ModuleNodeData>[] = snapshot.nodes.map((item) => ({
    id: item.id,
    type: "module",
    position: item.position,
    data: {
      title: item.title,
      stack: item.stack,
      description: item.description,
      health: item.health,
      submodules: item.submodules ?? [],
      details: item.details,
    },
    draggable: false,
    selectable: false,
  }));

  const edges: Edge<LinkEdgeData>[] = snapshot.edges.map((item) => ({
    ...(EDGE_ROUTE_MAP[item.id] ?? {
      sourceHandle: "out-r-mid",
      targetHandle: "in-l-mid",
      laneOffset: 20,
    }),
    id: item.id,
    source: item.source,
    target: item.target,
    type: item.health === "broken" ? "broken" : "flowing",
    data: {
      health: item.health,
      note: item.note,
      laneOffset: EDGE_ROUTE_MAP[item.id]?.laneOffset ?? 20,
    },
    animated: item.health !== "broken",
    selectable: false,
  }));
  return { nodes, edges };
}

function Content() {
  const [snapshot, setSnapshot] = useState<SystemHealthSnapshot>({
    generatedAt: "",
    nodes: [],
    edges: [],
  });
  const [logsSnapshot, setLogsSnapshot] = useState<SystemLogsSnapshot>({
    generatedAt: "",
    modules: [],
  });
  const [activeLogModuleId, setActiveLogModuleId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const deferredSnapshot = useDeferredValue(snapshot);
  const deferredLogsSnapshot = useDeferredValue(logsSnapshot);
  const { nodes, edges } = useMemo(() => toGraph(deferredSnapshot), [deferredSnapshot]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [topology, logs] = await Promise.all([
          fetchSystemHealthTopology(),
          fetchSystemLogs(),
        ]);
        if (!mounted) {
          return;
        }
        setSnapshot(topology);
        setLogsSnapshot(logs);
        setError(null);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err instanceof Error ? err.message : "failed to load system health");
      }
    };

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 15_000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (deferredLogsSnapshot.modules.length === 0) {
      if (activeLogModuleId !== "") {
        setActiveLogModuleId("");
      }
      return;
    }

    const exists = deferredLogsSnapshot.modules.some(
      (module) => module.moduleId === activeLogModuleId,
    );
    if (!exists) {
      setActiveLogModuleId(deferredLogsSnapshot.modules[0].moduleId);
    }
  }, [activeLogModuleId, deferredLogsSnapshot.modules]);

  const activeLogModule = useMemo(
    () =>
      deferredLogsSnapshot.modules.find((module) => module.moduleId === activeLogModuleId) ??
      deferredLogsSnapshot.modules[0],
    [activeLogModuleId, deferredLogsSnapshot.modules],
  );

  const nodeCounts = useMemo(
    () => ({
      healthy: deferredSnapshot.nodes.filter((item) => item.health === "healthy").length,
      warning: deferredSnapshot.nodes.filter((item) => item.health === "warning").length,
      offline: deferredSnapshot.nodes.filter((item) => item.health === "offline").length,
    }),
    [deferredSnapshot.nodes],
  );

  const edgeCounts = useMemo(
    () => ({
      healthy: deferredSnapshot.edges.filter((item) => item.health === "healthy").length,
      warning: deferredSnapshot.edges.filter((item) => item.health === "warning").length,
      broken: deferredSnapshot.edges.filter((item) => item.health === "broken").length,
    }),
    [deferredSnapshot.edges],
  );

  return (
    <PageTransition>
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">System Health</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time topology view of core modules, health states, and logical connectivity.
          </p>
        </div>
        {error ? <div className="text-sm text-loss">{error}</div> : null}

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Healthy Nodes</p>
            <p className="font-mono text-xl text-emerald-400">{nodeCounts.healthy}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Warning Nodes</p>
            <p className="font-mono text-xl text-yellow-400">{nodeCounts.warning}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Offline Nodes</p>
            <p className="font-mono text-xl text-red-400">{nodeCounts.offline}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Healthy Links</p>
            <p className="font-mono text-xl text-emerald-400">{edgeCounts.healthy}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Warning Links</p>
            <p className="font-mono text-xl text-yellow-400">{edgeCounts.warning}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Broken Links</p>
            <p className="font-mono text-xl text-red-400">{edgeCounts.broken}</p>
          </div>
        </div>

        <div className="system-health-canvas">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-600/30 bg-slate-900/40">
            <div className="text-xs text-slate-300">
              Live Snapshot:{" "}
              <span className="font-mono text-cyan-300">{deferredSnapshot.generatedAt}</span>
            </div>
            <div className="text-xs text-slate-300">
              Flow:{" "}
              <span className="font-mono text-slate-100">
                Left → Right (Engine → Data → Execution → Risk → Analytics)
              </span>
            </div>
          </div>

          <div className="h-[600px] system-health-grid">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{ padding: 0.16 }}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              zoomOnDoubleClick={false}
              minZoom={0.6}
              maxZoom={1.3}
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1f2a44" />
              <Controls
                showInteractive={false}
                style={{ background: "rgba(15, 23, 42, 0.78)", border: "1px solid #334155" }}
              />
            </ReactFlow>
          </div>
        </div>

        <div className="system-log-panel">
          <div className="system-log-header">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">System Logs</h2>
              <p className="text-[11px] text-slate-400 mt-1">
                Per-module health event stream from live probes.
              </p>
            </div>
            <p className="text-[11px] text-slate-400">
              Updated:{" "}
              <span className="font-mono text-cyan-300">
                {deferredLogsSnapshot.generatedAt || deferredSnapshot.generatedAt || "N/A"}
              </span>
            </p>
          </div>

          <div className="module-log-tabs-wrap">
            <div className="module-log-tabs">
              {deferredLogsSnapshot.modules.map((module) => (
                <button
                  key={module.moduleId}
                  type="button"
                  className="module-log-tab"
                  data-active={module.moduleId === activeLogModule?.moduleId}
                  data-health={module.health}
                  onClick={() => setActiveLogModuleId(module.moduleId)}
                >
                  <span className={ledClass(module.health)} />
                  <span>{module.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 pt-2">
            {activeLogModule ? (
              <div className="module-log-card" data-health={activeLogModule.health}>
                <div className="module-log-card-header">
                  <div className="flex items-center gap-2">
                    <span className={ledClass(activeLogModule.health)} />
                    <span className="text-xs font-semibold text-slate-100">
                      {activeLogModule.title}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase text-slate-400">
                    {healthText(activeLogModule.health)}
                  </span>
                </div>

                <div className="module-log-stream">
                  {activeLogModule.logs.length > 0 ? (
                    activeLogModule.logs.map((item, index) => (
                      <div key={`${activeLogModule.moduleId}-${index}`} className="module-log-row">
                        <span className="module-log-time">{formatLogTime(item.timestamp)}</span>
                        <span className={logLevelClass(item.level)}>{item.level}</span>
                        <span className="module-log-message">{item.message}</span>
                      </div>
                    ))
                  ) : (
                    <div className="module-log-empty">No log entries yet.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="module-log-empty">No modules available.</div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default function SystemHealthPage() {
  return (
    <DashboardLayout>
      {() => <Content />}
    </DashboardLayout>
  );
}
