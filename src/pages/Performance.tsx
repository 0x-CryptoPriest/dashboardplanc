
import { DashboardLayout } from "@/components/DashboardLayout";
import { EquityChart } from "@/components/trading/EquityChart";
import { DrawdownChart } from "@/components/trading/DrawdownChart";
import { MonthlyHeatmap } from "@/components/trading/MonthlyHeatmap";
import { PageTransition } from "@/components/PageTransition";
import {
  DrawdownPoint,
  EquityPoint,
  Exchange,
  fetchDrawdown,
  fetchEquityCurve,
  fetchMonthlyReturns,
  fetchPerformanceSummary,
  fetchReturnDistribution,
  fetchRollingSharpe,
  MonthlyReturn,
  PerformanceSummary,
  ReturnDistributionBucket,
  RollingSharpePoint,
} from "@/lib/planc-api";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function RollingSharpeChart({ data }: { data: RollingSharpePoint[] }) {
  if (data.length === 0) {
    return <div className="text-sm text-muted-foreground">No rolling sharpe data available.</div>;
  }

  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            tickFormatter={(value) => value.slice(5)}
            interval={15}
          />
          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
          <ReferenceLine
            y={2}
            stroke="hsl(var(--profit))"
            strokeDasharray="5 5"
            label={{ value: "Target", fill: "hsl(var(--profit))", fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="sharpe"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            dot={false}
            name="Rolling 90d Sharpe"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ReturnDistributionChart({ data }: { data: ReturnDistributionBucket[] }) {
  if (data.length === 0) {
    return <div className="text-sm text-muted-foreground">No return distribution available.</div>;
  }

  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="count" name="Frequency" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.midpoint >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"}
                fillOpacity={0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Content({ exchangeFilter: _exchangeFilter }: { exchangeFilter: Exchange | "all" }) {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [equityCurve, setEquityCurve] = useState<EquityPoint[]>([]);
  const [drawdown, setDrawdown] = useState<DrawdownPoint[]>([]);
  const [monthlyReturns, setMonthlyReturns] = useState<MonthlyReturn[]>([]);
  const [rollingSharpe, setRollingSharpe] = useState<RollingSharpePoint[]>([]);
  const [distribution, setDistribution] = useState<ReturnDistributionBucket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [summaryData, equityData, drawdownData, monthlyData, sharpeData, distributionData] = await Promise.all([
          fetchPerformanceSummary(),
          fetchEquityCurve("ALL"),
          fetchDrawdown(),
          fetchMonthlyReturns(),
          fetchRollingSharpe(),
          fetchReturnDistribution(),
        ]);
        if (!isMounted) return;
        setSummary(summaryData);
        setEquityCurve(equityData);
        setDrawdown(drawdownData);
        setMonthlyReturns(monthlyData);
        setRollingSharpe(sharpeData);
        setDistribution(distributionData);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "failed to load performance data");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const metricCards = summary
    ? [
        { label: "Total Return", value: `${summary.totalReturn > 0 ? "+" : ""}${summary.totalReturn}%` },
        { label: "Annualized", value: `${summary.annualizedReturn > 0 ? "+" : ""}${summary.annualizedReturn}%` },
        { label: "Sharpe Ratio", value: summary.sharpeRatio.toFixed(2) },
        { label: "Sortino Ratio", value: summary.sortinoRatio.toFixed(2) },
        { label: "Max Drawdown", value: `${summary.maxDrawdown}%` },
        { label: "Win Rate", value: `${summary.winRate}%` },
        { label: "Profit Factor", value: summary.profitFactor.toFixed(1) },
        { label: "Avg Trade", value: `${summary.avgTrade >= 0 ? "+" : ""}$${summary.avgTrade}` },
      ]
    : [];

  return (
    <PageTransition>
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-foreground">Performance</h1>
        {error ? <div className="text-sm text-loss">{error}</div> : null}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {(isLoading ? Array.from({ length: 8 }) : metricCards).map((metric, index) => (
            <div key={metric?.label ?? index} className="rounded-lg border border-border bg-card p-2">
              <div className="text-[10px] text-muted-foreground">{metric?.label ?? "Loading..."}</div>
              <div className="font-mono text-sm font-bold text-foreground">{metric?.value ?? "—"}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="equity" className="w-full">
          <TabsList className="bg-muted/50 flex-wrap">
            <TabsTrigger value="equity">Equity & Drawdown</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Returns</TabsTrigger>
            <TabsTrigger value="rolling">Rolling Sharpe</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="equity" className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">Equity Curve</h2>
              <EquityChart data={equityCurve} />
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">Drawdown</h2>
              <DrawdownChart data={drawdown} />
            </div>
          </TabsContent>

          <TabsContent value="monthly">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Monthly Returns Heatmap (QuantStats Style)
              </h2>
              <MonthlyHeatmap data={monthlyReturns} />
            </div>
          </TabsContent>

          <TabsContent value="rolling">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">Rolling 90-Day Sharpe Ratio</h2>
              <RollingSharpeChart data={rollingSharpe} />
            </div>
          </TabsContent>

          <TabsContent value="distribution">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">Daily Return Distribution</h2>
              <ReturnDistributionChart data={distribution} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}

export default function PerformancePage() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <Content exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
