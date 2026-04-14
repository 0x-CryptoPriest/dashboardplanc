
import { DashboardLayout } from "@/components/DashboardLayout";
import { RiskPanel } from "@/components/trading/RiskPanel";
import { DrawdownChart } from "@/components/trading/DrawdownChart";
import { PageTransition } from "@/components/PageTransition";
import { SkeletonCards, SkeletonChart } from "@/components/SkeletonDashboard";
import { Button } from "@/components/ui/button";
import {
  AllocationSlice,
  CorrelationPair,
  DrawdownPoint,
  EfficientFrontierPoint,
  Exchange,
  fetchDrawdown,
  fetchEfficientFrontier,
  fetchRiskAllocation,
  fetchRiskCorrelation,
  OptimizedAllocation,
} from "@/lib/planc-api";
import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ZAxis,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const palette = [
  "hsl(var(--warning))",
  "hsl(var(--primary))",
  "hsl(var(--chart-4))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--chart-5))",
];

function CorrelationMatrix({ correlations }: { correlations: CorrelationPair[] }) {
  const assets = useMemo(() => {
    const set = new Set<string>();
    correlations.forEach((pair) => {
      set.add(pair.asset1);
      set.add(pair.asset2);
    });
    return [...set];
  }, [correlations]);

  const getCorr = (asset1: string, asset2: string) => {
    if (asset1 === asset2) return 1;
    const pair = correlations.find(
      (item) =>
        (item.asset1 === asset1 && item.asset2 === asset2) ||
        (item.asset1 === asset2 && item.asset2 === asset1),
    );
    return pair?.correlation ?? 0;
  };

  const getCellColor = (value: number) => {
    if (value >= 0.8) return "bg-loss/60";
    if (value >= 0.6) return "bg-warning/40";
    if (value >= 0.4) return "bg-warning/20";
    if (value >= 0.2) return "bg-profit/20";
    return "bg-profit/40";
  };

  if (assets.length === 0) {
    return <div className="text-sm text-muted-foreground">No correlation data available.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-xs">
        <thead>
          <tr>
            <th className="p-2 text-muted-foreground"></th>
            {assets.map((asset) => (
              <th key={asset} className="p-2 text-center text-muted-foreground font-mono">
                {asset}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {assets.map((row) => (
            <tr key={row}>
              <td className="p-2 text-muted-foreground font-mono font-bold">{row}</td>
              {assets.map((column) => {
                const value = getCorr(row, column);
                return (
                  <td key={column} className="p-1">
                    <div
                      className={`${getCellColor(value)} rounded px-2 py-1.5 text-center font-mono min-w-[50px] ${value === 1 ? "text-primary font-bold" : "text-foreground"}`}
                    >
                      {value.toFixed(2)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
        <span>Low</span>
        <div className="flex gap-0.5">
          <div className="w-6 h-3 rounded bg-profit/40" />
          <div className="w-6 h-3 rounded bg-profit/20" />
          <div className="w-6 h-3 rounded bg-warning/20" />
          <div className="w-6 h-3 rounded bg-warning/40" />
          <div className="w-6 h-3 rounded bg-loss/60" />
        </div>
        <span>High</span>
      </div>
    </div>
  );
}

function EfficientFrontierChart({ data }: { data: EfficientFrontierPoint[] }) {
  const frontier = data.filter((point) => !point.isCurrent);
  const current = data.filter((point) => point.isCurrent);
  const optimal = data.filter((point) => point.isOptimal);

  if (data.length === 0) {
    return <div className="text-sm text-muted-foreground">No efficient frontier data available.</div>;
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            dataKey="risk"
            name="Risk (%)"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            label={{
              value: "Risk (Volatility %)",
              position: "bottom",
              fill: "hsl(var(--muted-foreground))",
              fontSize: 11,
            }}
          />
          <YAxis
            type="number"
            dataKey="return"
            name="Return (%)"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            label={{
              value: "Return %",
              angle: -90,
              position: "insideLeft",
              fill: "hsl(var(--muted-foreground))",
              fontSize: 11,
            }}
          />
          <ZAxis range={[60, 60]} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) => [`${value}%`, name]}
          />
          <Scatter
            name="Efficient Frontier"
            data={frontier}
            fill="hsl(var(--primary))"
            fillOpacity={0.6}
            line={{ stroke: "hsl(var(--primary))", strokeWidth: 2 }}
          />
          <Scatter name="Current Portfolio" data={current} fill="hsl(var(--warning))" shape="diamond">
            <ZAxis range={[200, 200]} />
          </Scatter>
          <Scatter name="Max Sharpe" data={optimal} fill="hsl(var(--profit))" shape="star">
            <ZAxis range={[200, 200]} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function Content({ exchangeFilter: _exchangeFilter }: { exchangeFilter: Exchange | "all" }) {
  const [allocation, setAllocation] = useState<AllocationSlice[]>([]);
  const [optimized, setOptimized] = useState<OptimizedAllocation[]>([]);
  const [recommendation, setRecommendation] = useState("");
  const [correlations, setCorrelations] = useState<CorrelationPair[]>([]);
  const [frontier, setFrontier] = useState<EfficientFrontierPoint[]>([]);
  const [drawdown, setDrawdown] = useState<DrawdownPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRisk = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allocationData, correlationData, frontierData, drawdownData] = await Promise.all([
        fetchRiskAllocation(),
        fetchRiskCorrelation(),
        fetchEfficientFrontier(),
        fetchDrawdown(),
      ]);
      setAllocation(allocationData.current);
      setOptimized(allocationData.optimized);
      setRecommendation(allocationData.recommendation);
      setCorrelations(correlationData);
      setFrontier(frontierData);
      setDrawdown(drawdownData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load risk data");
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
      await loadRisk();
    };
    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageTransition>
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-foreground">Risk Analysis</h1>
        {error ? (
          <div className="rounded-lg border border-loss/30 bg-loss/10 p-3 flex items-center justify-between gap-3">
            <p className="text-sm text-loss">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void loadRisk()}>
              Retry
            </Button>
          </div>
        ) : null}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="correlation">Correlation Matrix</TabsTrigger>
            <TabsTrigger value="frontier">Efficient Frontier</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h2 className="text-sm font-semibold text-foreground mb-3">Risk Metrics</h2>
                  {isLoading ? <SkeletonCards count={4} /> : <RiskPanel />}
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <h2 className="text-sm font-semibold text-foreground mb-3">Drawdown History</h2>
                  {isLoading ? <SkeletonChart /> : <DrawdownChart data={drawdown} />}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-semibold text-foreground mb-3">Asset Allocation</h2>
                {isLoading ? (
                  <SkeletonChart height="h-[250px]" />
                ) : (
                  <>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={allocation}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            dataKey="value"
                            stroke="none"
                          >
                            {allocation.map((entry, index) => (
                              <Cell key={entry.name} fill={palette[index % palette.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                            formatter={(value: number) => [`${value}%`, ""]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-2">
                      {allocation.map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: palette[index % palette.length] }}
                            />
                            <span className="text-muted-foreground">{entry.name}</span>
                          </div>
                          <span className="font-mono text-foreground">{entry.value}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="correlation">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Asset Correlation Matrix (skfolio)
              </h2>
              {isLoading ? <SkeletonChart /> : <CorrelationMatrix correlations={correlations} />}
            </div>
          </TabsContent>

          <TabsContent value="frontier">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">Efficient Frontier (skfolio)</h2>
              {isLoading ? <SkeletonChart /> : <EfficientFrontierChart data={frontier} />}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-primary" /> Frontier</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-warning" /> Current</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-profit" /> Max Sharpe</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="optimization">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Portfolio Optimization Suggestions (skfolio)
              </h2>
              {isLoading ? (
                <SkeletonCards count={3} />
              ) : (
                <div className="space-y-3">
                  {optimized.map((allocationItem) => (
                    <div key={allocationItem.name} className="flex items-center gap-3">
                      <span className="font-mono text-sm text-foreground w-16">{allocationItem.name}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-4 relative overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-warning/50 rounded-full"
                            style={{ width: `${allocationItem.current}%` }}
                          />
                          <div
                            className="absolute inset-y-0 left-0 border-r-2 border-profit h-full"
                            style={{ width: `${allocationItem.optimal}%` }}
                          />
                        </div>
                        <div className="text-xs font-mono w-20 text-right">
                          <span className="text-warning">{allocationItem.current}%</span>
                          <span className="text-muted-foreground"> → </span>
                          <span className="text-profit">{allocationItem.optimal}%</span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-mono ${allocationItem.optimal > allocationItem.current ? "text-profit" : allocationItem.optimal < allocationItem.current ? "text-loss" : "text-muted-foreground"}`}
                      >
                        {allocationItem.optimal > allocationItem.current ? "+" : ""}
                        {allocationItem.optimal - allocationItem.current}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                <strong className="text-primary">Recommendation:</strong> {recommendation}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}

export default function RiskPage() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <Content exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
