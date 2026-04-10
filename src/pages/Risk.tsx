import { DashboardLayout } from "@/components/DashboardLayout";
import { RiskPanel } from "@/components/trading/RiskPanel";
import { DrawdownChart } from "@/components/trading/DrawdownChart";
import { Exchange, mockCorrelations, mockEfficientFrontier } from "@/lib/mock-data";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const allocationData = [
  { name: 'BTC', value: 45, color: 'hsl(38, 92%, 55%)' },
  { name: 'ETH', value: 25, color: 'hsl(190, 95%, 50%)' },
  { name: 'SOL', value: 15, color: 'hsl(280, 70%, 60%)' },
  { name: 'Others', value: 15, color: 'hsl(215, 15%, 50%)' },
];

const optimizedAllocation = [
  { name: 'BTC', current: 45, optimal: 35 },
  { name: 'ETH', current: 25, optimal: 30 },
  { name: 'SOL', current: 15, optimal: 20 },
  { name: 'AVAX', current: 8, optimal: 10 },
  { name: 'Others', current: 7, optimal: 5 },
];

function CorrelationMatrix() {
  const assets = ['BTC', 'ETH', 'SOL', 'AVAX', 'ARB', 'DOGE'];

  const getCorr = (a1: string, a2: string) => {
    if (a1 === a2) return 1;
    const pair = mockCorrelations.find(c => (c.asset1 === a1 && c.asset2 === a2) || (c.asset1 === a2 && c.asset2 === a1));
    return pair?.correlation ?? 0;
  };

  const getCellColor = (val: number) => {
    if (val >= 0.8) return 'bg-loss/60';
    if (val >= 0.6) return 'bg-warning/40';
    if (val >= 0.4) return 'bg-warning/20';
    if (val >= 0.2) return 'bg-profit/20';
    return 'bg-profit/40';
  };

  return (
    <div className="overflow-x-auto">
      <table className="text-xs">
        <thead>
          <tr>
            <th className="p-2 text-muted-foreground"></th>
            {assets.map(a => <th key={a} className="p-2 text-center text-muted-foreground font-mono">{a}</th>)}
          </tr>
        </thead>
        <tbody>
          {assets.map(row => (
            <tr key={row}>
              <td className="p-2 text-muted-foreground font-mono font-bold">{row}</td>
              {assets.map(col => {
                const v = getCorr(row, col);
                return (
                  <td key={col} className="p-1">
                    <div className={`${getCellColor(v)} rounded px-2 py-1.5 text-center font-mono min-w-[50px] ${v === 1 ? 'text-primary font-bold' : 'text-foreground'}`}>
                      {v.toFixed(2)}
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

function EfficientFrontierChart() {
  const frontier = mockEfficientFrontier.filter(p => !p.isCurrent);
  const current = mockEfficientFrontier.filter(p => p.isCurrent);
  const optimal = mockEfficientFrontier.filter(p => p.isOptimal);

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 14%)" />
          <XAxis type="number" dataKey="risk" name="Risk (%)" tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 10 }} label={{ value: 'Risk (Volatility %)', position: 'bottom', fill: 'hsl(215, 15%, 50%)', fontSize: 11 }} />
          <YAxis type="number" dataKey="return" name="Return (%)" tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 10 }} label={{ value: 'Return %', angle: -90, position: 'insideLeft', fill: 'hsl(215, 15%, 50%)', fontSize: 11 }} />
          <ZAxis range={[60, 60]} />
          <Tooltip contentStyle={{ background: 'hsl(220, 25%, 8%)', border: '1px solid hsl(220, 20%, 14%)', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number, name: string) => [`${v}%`, name]} />
          <Scatter name="Efficient Frontier" data={frontier} fill="hsl(190, 95%, 50%)" fillOpacity={0.6} line={{ stroke: 'hsl(190, 95%, 50%)', strokeWidth: 2 }} />
          <Scatter name="Current Portfolio" data={current} fill="hsl(38, 92%, 55%)" shape="diamond">
            <ZAxis range={[200, 200]} />
          </Scatter>
          <Scatter name="Max Sharpe" data={optimal} fill="hsl(145, 70%, 50%)" shape="star">
            <ZAxis range={[200, 200]} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function Content({ exchangeFilter: _ }: { exchangeFilter: Exchange | 'all' }) {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-foreground">Risk Analysis</h1>

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
                <RiskPanel />
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-semibold text-foreground mb-3">Drawdown History</h2>
                <DrawdownChart />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">Asset Allocation</h2>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocationData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                      {allocationData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(220, 25%, 8%)', border: '1px solid hsl(220, 20%, 14%)', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [`${value}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {allocationData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-mono text-foreground">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="correlation">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Asset Correlation Matrix (skfolio)</h2>
            <CorrelationMatrix />
          </div>
        </TabsContent>

        <TabsContent value="frontier">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Efficient Frontier (skfolio)</h2>
            <EfficientFrontierChart />
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full" style={{ background: 'hsl(190, 95%, 50%)' }} /> Frontier</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: 'hsl(38, 92%, 55%)' }} /> Current</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: 'hsl(145, 70%, 50%)' }} /> Max Sharpe</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="optimization">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Portfolio Optimization Suggestions (skfolio)</h2>
            <div className="space-y-3">
              {optimizedAllocation.map(a => (
                <div key={a.name} className="flex items-center gap-3">
                  <span className="font-mono text-sm text-foreground w-16">{a.name}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-4 relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-warning/50 rounded-full" style={{ width: `${a.current}%` }} />
                      <div className="absolute inset-y-0 left-0 border-r-2 border-profit h-full" style={{ width: `${a.optimal}%` }} />
                    </div>
                    <div className="text-xs font-mono w-20 text-right">
                      <span className="text-warning">{a.current}%</span>
                      <span className="text-muted-foreground"> → </span>
                      <span className="text-profit">{a.optimal}%</span>
                    </div>
                  </div>
                  <span className={`text-xs font-mono ${a.optimal > a.current ? 'text-profit' : a.optimal < a.current ? 'text-loss' : 'text-muted-foreground'}`}>
                    {a.optimal > a.current ? '+' : ''}{a.optimal - a.current}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
              <strong className="text-primary">Recommendation:</strong> Reduce BTC concentration from 45% to 35% and increase SOL/ETH allocation. This would improve the Sharpe ratio from 2.15 → 2.48 and reduce max drawdown from -8.5% → -6.2%.
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function RiskPage() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <Content exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
