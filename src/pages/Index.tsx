import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/trading/MetricCard";
import { PositionsTable } from "@/components/trading/PositionsTable";
import { StrategyCard } from "@/components/trading/StrategyCard";
import { EquityChart } from "@/components/trading/EquityChart";
import { PageTransition } from "@/components/PageTransition";
import {
  SkeletonCards,
  SkeletonChart,
  SkeletonMetricCards,
  SkeletonTable,
} from "@/components/SkeletonDashboard";
import { Button } from "@/components/ui/button";
import { Exchange, fetchDashboardSnapshot, AccountSummary, Position, Strategy } from "@/lib/planc-api";
import { DollarSign, TrendingUp, Percent, Shield, Wallet, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";

function DashboardContent({ exchangeFilter }: { exchangeFilter: Exchange | 'all' }) {
  const [accounts, setAccounts] = useState<Record<Exchange, AccountSummary>>({
    binance: {
      exchange: "binance",
      totalEquity: 0,
      spotEquity: 0,
      futuresEquity: 0,
      availableBalance: 0,
      unrealizedPnl: 0,
      dailyPnl: 0,
      dailyPnlPercent: 0,
      marginUsed: 0,
      marginRatio: 0,
    },
    hyperliquid: {
      exchange: "hyperliquid",
      totalEquity: 0,
      spotEquity: 0,
      futuresEquity: 0,
      availableBalance: 0,
      unrealizedPnl: 0,
      dailyPnl: 0,
      dailyPnlPercent: 0,
      marginUsed: 0,
      marginRatio: 0,
    },
  });
  const [positions, setPositions] = useState<Position[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSnapshot = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const snapshot = await fetchDashboardSnapshot();
      setAccounts(snapshot.accounts);
      setPositions(snapshot.positions);
      setStrategies(snapshot.strategies);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load dashboard");
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
      await loadSnapshot();
    };

    void load();
    const timer = window.setInterval(() => {
      if (isMounted) {
        void loadSnapshot().catch(() => null);
      }
    }, 20_000);
    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const scopedAccounts = exchangeFilter === 'all'
    ? Object.values(accounts)
    : [accounts[exchangeFilter]];

  const totalEquity = scopedAccounts.reduce((sum, account) => sum + account.totalEquity, 0);
  const spotEquity = scopedAccounts.reduce((sum, account) => sum + account.spotEquity, 0);
  const futuresEquity = scopedAccounts.reduce((sum, account) => sum + account.futuresEquity, 0);
  const dailyPnl = scopedAccounts.reduce((sum, account) => sum + account.dailyPnl, 0);
  const unrealizedPnl = scopedAccounts.reduce((sum, account) => sum + account.unrealizedPnl, 0);
  const avgMarginRatio = scopedAccounts.length > 0
    ? scopedAccounts.reduce((sum, account) => sum + account.marginRatio, 0) / scopedAccounts.length
    : 0;

  const activeStrategies = exchangeFilter === 'all'
    ? strategies.filter((strategy) => strategy.status === 'RUNNING')
    : strategies.filter((strategy) => strategy.exchange === exchangeFilter && strategy.status === 'RUNNING');

  return (
    <PageTransition>
      <div className="space-y-4">
        {error ? (
          <div className="rounded-lg border border-loss/30 bg-loss/10 p-3 flex items-center justify-between gap-3">
            <p className="text-sm text-loss">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void loadSnapshot()}>
              Retry
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <SkeletonMetricCards count={6} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <MetricCard title="Total Equity" value={`$${totalEquity.toLocaleString()}`} icon={DollarSign} delay={0} />
            <MetricCard title="Spot Equity" value={`$${spotEquity.toLocaleString()}`} icon={Wallet} delay={0.05} />
            <MetricCard title="Futures Equity" value={`$${futuresEquity.toLocaleString()}`} icon={BarChart3} delay={0.1} />
            <MetricCard title="Daily PnL" value={`$${Math.abs(dailyPnl).toLocaleString()}`} change={`$${Math.abs(dailyPnl).toLocaleString()}`} changePercent={dailyPnl >= 0 ? 0.97 : -0.41} icon={TrendingUp} delay={0.15} />
            <MetricCard title="Unrealized PnL" value={`$${Math.abs(unrealizedPnl).toLocaleString()}`} change={`$${Math.abs(unrealizedPnl).toLocaleString()}`} changePercent={unrealizedPnl >= 0 ? 1.5 : -0.8} icon={Percent} delay={0.2} />
            <MetricCard title="Margin Ratio" value={`${(avgMarginRatio * 100).toFixed(1)}%`} icon={Shield} delay={0.25} />
          </div>
        )}

        {isLoading ? (
          <SkeletonChart />
        ) : (
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Equity Curve</h2>
            <EquityChart />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4 overflow-x-auto">
            <h2 className="text-sm font-semibold text-foreground mb-3">Open Positions</h2>
            {isLoading ? (
              <SkeletonTable rows={6} />
            ) : (
              <PositionsTable positions={positions} exchangeFilter={exchangeFilter} />
            )}
          </div>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Active Strategies</h2>
            {isLoading ? (
              <SkeletonCards count={2} />
            ) : (
              activeStrategies.map((strategy, index) => (
                <StrategyCard key={strategy.id} strategy={strategy} delay={index * 0.05} />
              ))
            )}
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
