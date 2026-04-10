import { DashboardLayout } from "@/components/DashboardLayout";
import { Exchange, mockDataSources, DataSource } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { Database, HardDrive, Wifi, AlertTriangle, RefreshCw, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const typeIcons: Record<string, typeof Database> = {
  exchange: Wifi,
  parquet: HardDrive,
  duckdb: Database,
  api: RefreshCw,
};

const statusConfig: Record<string, { color: string; bg: string }> = {
  CONNECTED: { color: 'text-profit', bg: 'bg-profit/10' },
  DISCONNECTED: { color: 'text-muted-foreground', bg: 'bg-muted/30' },
  ERROR: { color: 'text-loss', bg: 'bg-loss/10' },
  SYNCING: { color: 'text-primary', bg: 'bg-primary/10' },
};

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`;
  return `${(bytes / 1_000).toFixed(0)} KB`;
}

function DataSourceCard({ source, delay }: { source: DataSource; delay: number }) {
  const Icon = typeIcons[source.type] || Database;
  const { color, bg } = statusConfig[source.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
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
          {source.status === 'CONNECTED' ? <CheckCircle className="h-3 w-3" /> : source.status === 'ERROR' ? <AlertTriangle className="h-3 w-3" /> : <RefreshCw className="h-3 w-3" />}
          {source.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div><span className="text-muted-foreground">Records:</span> <span className="font-mono text-foreground">{source.recordCount.toLocaleString()}</span></div>
        <div><span className="text-muted-foreground">Size:</span> <span className="font-mono text-foreground">{formatBytes(source.sizeBytes)}</span></div>
        <div><span className="text-muted-foreground">Last Sync:</span> <span className="font-mono text-foreground">{source.lastSync.split(' ')[1]}</span></div>
        <div><span className="text-muted-foreground">Latency:</span> <span className="font-mono text-foreground">{source.quality.latency}</span></div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Completeness</span>
          <span className={`font-mono ${source.quality.completeness >= 99 ? 'text-profit' : source.quality.completeness >= 95 ? 'text-warning' : 'text-loss'}`}>{source.quality.completeness}%</span>
        </div>
        <Progress value={source.quality.completeness} className="h-1.5" />
      </div>

      <div className="text-xs">
        <span className="text-muted-foreground">Coverage: </span>
        <span className="font-mono text-foreground">{source.coverage.from} → {source.coverage.to}</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {source.instruments.map(inst => (
          <span key={inst} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{inst}</span>
        ))}
      </div>

      <div className="flex flex-wrap gap-1">
        {source.timeframes.map(tf => (
          <span key={tf} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">{tf}</span>
        ))}
      </div>

      {source.quality.gaps > 0 && (
        <div className="flex items-center gap-1 text-xs text-warning">
          <AlertTriangle className="h-3 w-3" />
          {source.quality.gaps} data gap{source.quality.gaps > 1 ? 's' : ''} detected
        </div>
      )}
    </motion.div>
  );
}

function Content({ exchangeFilter: _ }: { exchangeFilter: Exchange | 'all' }) {
  const totalRecords = mockDataSources.reduce((s, d) => s + d.recordCount, 0);
  const totalSize = mockDataSources.reduce((s, d) => s + d.sizeBytes, 0);
  const connected = mockDataSources.filter(d => d.status === 'CONNECTED').length;
  const errors = mockDataSources.filter(d => d.status === 'ERROR').length;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-foreground">Data Management</h1>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Data Sources', value: mockDataSources.length.toString(), sub: `${connected} connected` },
          { label: 'Total Records', value: `${(totalRecords / 1_000_000).toFixed(0)}M`, sub: formatBytes(totalSize) },
          { label: 'Total Gaps', value: mockDataSources.reduce((s, d) => s + d.quality.gaps, 0).toString(), sub: 'across all sources' },
          { label: 'Issues', value: errors.toString(), sub: errors > 0 ? 'needs attention' : 'all healthy' },
        ].map(m => (
          <div key={m.label} className="rounded-lg border border-border bg-card p-3">
            <div className="text-xs text-muted-foreground">{m.label}</div>
            <div className="font-mono text-lg font-bold text-foreground">{m.value}</div>
            <div className="text-[10px] text-muted-foreground">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Data source cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockDataSources.map((source, i) => (
          <DataSourceCard key={source.id} source={source} delay={i * 0.05} />
        ))}
      </div>
    </div>
  );
}

export default function DataManagementPage() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <Content exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
