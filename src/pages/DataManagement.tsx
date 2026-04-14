import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { DataSource, Exchange, fetchDataSources } from "@/lib/planc-api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Database, HardDrive, Wifi, AlertTriangle, RefreshCw, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SkeletonCards } from "@/components/SkeletonDashboard";
import { Button } from "@/components/ui/button";

const typeIcons: Record<string, typeof Database> = {
  exchange: Wifi,
  parquet: HardDrive,
  duckdb: Database,
  api: RefreshCw,
};

const statusConfig: Record<string, { color: string; bg: string }> = {
  CONNECTED: { color: "text-profit", bg: "bg-profit/10" },
  DISCONNECTED: { color: "text-muted-foreground", bg: "bg-muted/30" },
  ERROR: { color: "text-loss", bg: "bg-loss/10" },
  SYNCING: { color: "text-primary", bg: "bg-primary/10" },
};

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`;
  return `${(bytes / 1_000).toFixed(0)} KB`;
}

function formatRecordCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(0)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toLocaleString();
}

function DataSourceCard({ source, delay }: { source: DataSource; delay: number }) {
  const Icon = typeIcons[source.type] || Database;
  const { color, bg } = statusConfig[source.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-lg border border-border bg-card p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{source.name}</h3>
            <span className="text-[10px] text-muted-foreground uppercase">{source.type}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-xs ${color} ${bg} px-2 py-0.5 rounded-full`}>
          {source.status === "CONNECTED" ? <CheckCircle className="h-3 w-3" /> : source.status === "ERROR" ? <AlertTriangle className="h-3 w-3" /> : <RefreshCw className="h-3 w-3" />}
          {source.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div><span className="text-muted-foreground">Records:</span> <span className="font-mono text-foreground">{source.recordCount.toLocaleString()}</span></div>
        <div><span className="text-muted-foreground">Size:</span> <span className="font-mono text-foreground">{formatBytes(source.sizeBytes)}</span></div>
        <div><span className="text-muted-foreground">Last Sync:</span> <span className="font-mono text-foreground">{source.lastSync}</span></div>
        <div><span className="text-muted-foreground">Detail:</span> <span className="font-mono text-foreground">{source.quality.latency}</span></div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Completeness</span>
          <span className={`font-mono ${source.quality.completeness >= 99 ? "text-profit" : source.quality.completeness >= 95 ? "text-warning" : "text-loss"}`}>{source.quality.completeness}%</span>
        </div>
        <Progress value={source.quality.completeness} className="h-1.5" />
      </div>

      <div className="text-xs">
        <span className="text-muted-foreground">Coverage: </span>
        <span className="font-mono text-foreground">{source.coverage.from} → {source.coverage.to}</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {source.instruments.length > 0 ? source.instruments.map((instrument) => (
          <span key={instrument} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{instrument}</span>
        )) : (
          <span className="text-[10px] text-muted-foreground">No instruments indexed</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {source.timeframes.length > 0 ? source.timeframes.map((timeframe) => (
          <span key={timeframe} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">{timeframe}</span>
        )) : (
          <span className="text-[10px] text-muted-foreground">No timeframes detected</span>
        )}
      </div>

      {source.quality.gaps > 0 && (
        <div className="flex items-center gap-1 text-xs text-warning">
          <AlertTriangle className="h-3 w-3" />
          {source.quality.gaps} data gap{source.quality.gaps > 1 ? "s" : ""} detected
        </div>
      )}
    </motion.div>
  );
}

function Content({ exchangeFilter: _exchangeFilter }: { exchangeFilter: Exchange | "all" }) {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSources = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDataSources();
      setSources(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load data sources");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!isMounted) {
        return;
      }
      await loadSources();
    };

    void load();
    const interval = window.setInterval(() => {
      if (isMounted) {
        void loadSources().catch(() => null);
      }
    }, 30_000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const totalRecords = sources.reduce((sum, source) => sum + source.recordCount, 0);
  const totalSize = sources.reduce((sum, source) => sum + source.sizeBytes, 0);
  const connected = sources.filter((source) => source.status === "CONNECTED").length;
  const errors = sources.filter((source) => source.status === "ERROR").length;

  return (
    <PageTransition>
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">Data Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Market data is ingested continuously in the background. This page shows feed health, freshness, and gap repair status.
          </p>
        </div>
        {error ? (
          <div className="rounded-lg border border-loss/30 bg-loss/10 p-3 flex items-center justify-between gap-3">
            <p className="text-sm text-loss">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void loadSources()}>
              Retry
            </Button>
          </div>
        ) : null}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Data Sources", value: sources.length.toString(), sub: `${connected} connected` },
            { label: "Total Records", value: formatRecordCount(totalRecords), sub: formatBytes(totalSize) },
            { label: "Total Gaps", value: sources.reduce((sum, source) => sum + source.quality.gaps, 0).toString(), sub: "across all sources" },
            { label: "Issues", value: errors.toString(), sub: errors > 0 ? "needs attention" : "all healthy" },
          ].map((metric) => (
            <div key={metric.label} className="rounded-lg border border-border bg-card p-3">
              <div className="text-xs text-muted-foreground">{metric.label}</div>
              <div className="font-mono text-lg font-bold text-foreground">{metric.value}</div>
              <div className="text-[10px] text-muted-foreground">{metric.sub}</div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <SkeletonCards count={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((source, index) => (
              <DataSourceCard key={source.id} source={source} delay={index * 0.05} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default function DataManagementPage() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <Content exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
