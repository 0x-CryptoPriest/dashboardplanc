import { DashboardLayout } from "@/components/DashboardLayout";
import { EquityChart } from "@/components/trading/EquityChart";
import { DrawdownChart } from "@/components/trading/DrawdownChart";
import { Exchange } from "@/lib/mock-data";

function Content({ exchangeFilter: _ }: { exchangeFilter: Exchange | 'all' }) {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-foreground">Performance</h1>
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Equity Curve</h2>
        <EquityChart />
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Drawdown</h2>
        <DrawdownChart />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Return', value: '+85.2%' },
          { label: 'Annualized', value: '+142.3%' },
          { label: 'Sharpe Ratio', value: '2.15' },
          { label: 'Sortino Ratio', value: '3.02' },
          { label: 'Max Drawdown', value: '-8.5%' },
          { label: 'Win Rate', value: '62%' },
          { label: 'Profit Factor', value: '2.4' },
          { label: 'Avg Trade', value: '+$234' },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-border bg-card p-3">
            <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
            <div className="font-mono text-lg font-bold text-foreground">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PerformancePage() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <Content exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
