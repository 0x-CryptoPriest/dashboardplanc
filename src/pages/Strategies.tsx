import { DashboardLayout } from "@/components/DashboardLayout";
import { StrategyControlModal } from "@/components/strategy/StrategyControlModal";
import { StrategyCard } from "@/components/trading/StrategyCard";
import { PageTransition } from "@/components/PageTransition";
import { SkeletonCards } from "@/components/SkeletonDashboard";
import { Button } from "@/components/ui/button";
import {
  Exchange,
  Strategy,
  fetchTradingOverview,
  startStrategy,
  stopStrategy,
} from "@/lib/planc-api";
import { RealtimePayload, useRealtimeUpdates } from "@/lib/useWebSocket";
import { Activity, Radar, RadioTower } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";

type StrategyAction = "start" | "stop";
const REALTIME_CHANNELS = ["strategy", "trading"];

type PendingControl = {
  strategy: Strategy;
  action: StrategyAction;
};

type SignalEvent = {
  id: string;
  timestamp: string;
  mode: string;
  signalType: string;
  symbol: string;
  zScore: string;
  message: string;
};

function formatNow(): string {
  return new Date().toLocaleTimeString([], { hour12: false });
}

function toSignalEntry(payload: RealtimePayload): SignalEvent | null {
  const event = typeof payload.event === "string" ? payload.event : "";
  if (!event) {
    return null;
  }

  const now = formatNow();
  const data = payload.data;
  const strategyId =
    typeof payload.strategy_id === "string"
      ? payload.strategy_id
      : data && typeof data === "object" && typeof (data as { strategy_id?: unknown }).strategy_id === "string"
        ? String((data as { strategy_id: unknown }).strategy_id)
        : "N/A";

  if (event === "strategy.started" || event === "strategy.stopped") {
    return {
      id: `${event}-${strategyId}-${Date.now()}`,
      timestamp: now,
      mode: "Strategy",
      signalType: event === "strategy.started" ? "START" : "STOP",
      symbol: strategyId.toUpperCase(),
      zScore: "—",
      message: event === "strategy.started" ? "Strategy resumed" : "Strategy halted",
    };
  }

  if (event === "order.submitted") {
    const orderData = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    const symbol =
      typeof orderData.symbol === "string"
        ? orderData.symbol
        : typeof orderData.order_id === "string"
          ? orderData.order_id
          : "N/A";
    return {
      id: `order-submitted-${Date.now()}`,
      timestamp: now,
      mode: "Execution",
      signalType: "ORDER",
      symbol: symbol.toUpperCase(),
      zScore: "—",
      message: "Order submitted to execution router",
    };
  }

  return null;
}

function Content({ exchangeFilter }: { exchangeFilter: Exchange | "all" }) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [positionCount, setPositionCount] = useState(0);
  const [unrealizedPnl, setUnrealizedPnl] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingControl, setPendingControl] = useState<PendingControl | null>(null);
  const [signals, setSignals] = useState<SignalEvent[]>([]);

  const { isConnected } = useRealtimeUpdates({
    channels: REALTIME_CHANNELS,
    onMessage: (payload) => {
      const entry = toSignalEntry(payload);
      if (!entry) {
        return;
      }
      setSignals((previous) => [entry, ...previous].slice(0, 50));
    },
  });

  const refreshOverview = async () => {
    try {
      const overview = await fetchTradingOverview();
      setStrategies(overview.strategies);
      setPositionCount(overview.positions.length);
      setUnrealizedPnl(
        overview.positions.reduce((sum, position) => sum + Number(position.unrealizedPnl || 0), 0),
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load strategies");
      throw err;
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        await refreshOverview();
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "failed to load strategies");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();
    const timer = window.setInterval(() => {
      void refreshOverview().catch(() => null);
    }, 20_000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const filtered =
    exchangeFilter === "all"
      ? strategies
      : strategies.filter((strategy) => strategy.exchange === exchangeFilter);

  const modalStrategy = pendingControl?.strategy ?? null;
  const modalAction = pendingControl?.action ?? "stop";

  const handleControlRequest = (strategy: Strategy, action: StrategyAction) => {
    setPendingControl({ strategy, action });
  };

  const handleControlConfirm = async () => {
    if (!pendingControl) {
      return;
    }

    const { strategy, action } = pendingControl;
    setIsSubmitting(true);
    try {
      if (action === "start") {
        await startStrategy(strategy.id);
      } else {
        await stopStrategy(strategy.id);
      }

      setStrategies((previous) =>
        previous.map((item) =>
          item.id === strategy.id
            ? { ...item, status: action === "start" ? "RUNNING" : "STOPPED" }
            : item,
        ),
      );
      setSignals((previous) => {
        const event: SignalEvent = {
          id: `${strategy.id}-${action}-${Date.now()}`,
          timestamp: formatNow(),
          mode: "Manual",
          signalType: action.toUpperCase(),
          symbol: strategy.id.toUpperCase(),
          zScore: "—",
          message: action === "start" ? "Manual start confirmed" : "Manual stop confirmed",
        };
        return [event, ...previous].slice(0, 50);
      });

      toast.success(
        action === "start"
          ? `${strategy.name} started successfully`
          : `${strategy.name} stopped successfully`,
      );
      await refreshOverview();
      setError(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "strategy operation failed");
    } finally {
      setIsSubmitting(false);
      setPendingControl(null);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">Strategies</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Runbook and live signal feed for active strategy modules.
          </p>
        </div>
        {error ? (
          <div className="rounded-lg border border-loss/30 bg-loss/10 p-3 flex items-center justify-between gap-3">
            <p className="text-sm text-loss">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void refreshOverview()}>
              Retry
            </Button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4 items-start">
          <div className="space-y-4">
            {isLoading ? (
              <SkeletonCards count={4} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((strategy, index) => (
                  <StrategyCard
                    key={strategy.id}
                    strategy={strategy}
                    delay={index * 0.05}
                    isSubmitting={isSubmitting}
                    onStart={(item) => handleControlRequest(item, "start")}
                    onStop={(item) => handleControlRequest(item, "stop")}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card sticky top-16">
            <div className="border-b border-border px-3 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radar className="h-4 w-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Signal Stream</h2>
                  <p className="text-[10px] text-muted-foreground">Recent 50 realtime events</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span
                  className={`h-2 w-2 rounded-full ${isConnected ? "bg-profit" : "bg-loss animate-ping"}`}
                />
                <span className="text-muted-foreground">{isConnected ? "实时" : "重连中"}</span>
              </div>
            </div>

            <div className="max-h-[560px] overflow-auto px-3 py-2 space-y-2">
              {signals.length > 0 ? (
                signals.map((signal) => (
                  <div
                    key={signal.id}
                    className="rounded-md border border-border/70 bg-muted/20 p-2.5 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-cyan-300">{signal.timestamp}</span>
                      <span className="text-muted-foreground uppercase tracking-wide">
                        {signal.mode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-primary">
                        {signal.signalType}
                      </span>
                      <span className="font-mono text-foreground">{signal.symbol}</span>
                      <span className="text-muted-foreground">Z:</span>
                      <span className="font-mono text-foreground">{signal.zScore}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{signal.message}</div>
                  </div>
                ))
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-muted-foreground text-xs">
                  <RadioTower className="h-4 w-4 mb-2" />
                  Waiting for strategy events...
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card px-3 py-2.5 text-xs flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Open Positions:</span>
            <span className="font-mono text-foreground">{positionCount}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Unrealized PnL: </span>
            <span className={`font-mono ${unrealizedPnl >= 0 ? "text-profit" : "text-loss"}`}>
              {unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnl.toLocaleString()}
            </span>
          </div>
          <div className="text-muted-foreground">
            Strategy controls require confirmation and support keyboard ESC cancel.
          </div>
        </div>
      </div>

      <StrategyControlModal
        open={pendingControl !== null}
        strategy={modalStrategy}
        action={modalAction}
        positionCount={positionCount}
        unrealizedPnl={unrealizedPnl}
        isSubmitting={isSubmitting}
        onCancel={() => setPendingControl(null)}
        onConfirm={() => {
          void handleControlConfirm();
        }}
      />
    </PageTransition>
  );
}

export default function StrategiesPage() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <Content exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
