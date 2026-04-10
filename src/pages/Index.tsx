import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/trading/MetricCard";
import { PositionsTable } from "@/components/trading/PositionsTable";
import { StrategyCard } from "@/components/trading/StrategyCard";
import { EquityChart } from "@/components/trading/EquityChart";
import { PageTransition } from "@/components/PageTransition";
import { mockAccounts, mockPositions, mockStrategies, Exchange } from "@/lib/mock-data";
import { DollarSign, TrendingUp, Percent, Shield } from "lucide-react";

function DashboardContent({ exchangeFilter }: { exchangeFilter: Exchange | 'all' }) {
  const accounts = exchangeFilter === 'all'
    ? Object.values(mockAccounts)
    : [mockAccounts[exchangeFilter]];

  const totalEquity = accounts.reduce((s, a) => s + a.totalEquity, 0);
  const dailyPnl = accounts.reduce((s, a) => s + a.dailyPnl, 0);
  const unrealizedPnl = accounts.reduce((s, a) => s + a.unrealizedPnl, 0);
  const avgMarginRatio = accounts.reduce((s, a) => s + a.marginRatio, 0) / accounts.length;

  const strategies = exchangeFilter === 'all'
    ? mockStrategies.filter(s => s.status === 'RUNNING')
    : mockStrategies.filter(s => s.exchange === exchangeFilter && s.status === 'RUNNING');

  return (
    <PageTransition>
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard title="Total Equity" value={`$${totalEquity.toLocaleString()}`} icon={DollarSign} delay={0} />
          <MetricCard title="Daily PnL" value={`$${Math.abs(dailyPnl).toLocaleString()}`} change={`$${Math.abs(dailyPnl).toLocaleString()}`} changePercent={dailyPnl >= 0 ? 0.97 : -0.41} icon={TrendingUp} delay={0.05} />
          <MetricCard title="Unrealized PnL" value={`$${Math.abs(unrealizedPnl).toLocaleString()}`} change={`$${Math.abs(unrealizedPnl).toLocaleString()}`} changePercent={unrealizedPnl >= 0 ? 1.5 : -0.8} icon={Percent} delay={0.1} />
          <MetricCard title="Margin Ratio" value={`${(avgMarginRatio * 100).toFixed(1)}%`} icon={Shield} delay={0.15} />
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Equity Curve</h2>
          <EquityChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4 overflow-x-auto">
            <h2 className="text-sm font-semibold text-foreground mb-3">Open Positions</h2>
            <PositionsTable positions={mockPositions} exchangeFilter={exchangeFilter} />
          </div>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Active Strategies</h2>
            {strategies.map((s, i) => (
              <StrategyCard key={s.id} strategy={s} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default function Index() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <DashboardContent exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
