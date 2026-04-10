import { DashboardLayout } from "@/components/DashboardLayout";
import { EquityChart } from "@/components/trading/EquityChart";
import { DrawdownChart } from "@/components/trading/DrawdownChart";
import { Exchange, mockMonthlyReturns, generateRollingSharpe, generateReturnDistribution } from "@/lib/mock-data";
import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function MonthlyHeatmap() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = [...new Set(mockMonthlyReturns.map(d => d.year))];

  const getColor = (val: number) => {
    if (val > 10) return 'bg-profit/80 text-primary-foreground';
    if (val > 5) return 'bg-profit/50 text-foreground';
    if (val > 0) return 'bg-profit/20 text-foreground';
    if (val > -3) return 'bg-loss/20 text-foreground';
    if (val > -5) return 'bg-loss/50 text-foreground';
    return 'bg-loss/80 text-primary-foreground';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left text-muted-foreground p-1.5">Year</th>
            {months.map(m => <th key={m} className="text-center text-muted-foreground p-1.5">{m}</th>)}
            <th className="text-center text-muted-foreground p-1.5 font-bold">Total</th>
          </tr>
        </thead>
        <tbody>
          {years.map(year => {
            const yearData = mockMonthlyReturns.filter(d => d.year === year);
            const total = yearData.reduce((s, d) => s + d.return, 0);
            return (
              <tr key={year}>
                <td className="text-muted-foreground font-mono p-1.5 font-bold">{year}</td>
                {months.map((_, mi) => {
                  const d = yearData.find(r => r.month === mi + 1);
                  return (
                    <td key={mi} className="p-0.5">
                      {d ? (
                        <div className={`${getColor(d.return)} rounded px-2 py-1.5 text-center font-mono`}>
                          {d.return > 0 ? '+' : ''}{d.return.toFixed(1)}%
                        </div>
                      ) : <div className="bg-muted/30 rounded px-2 py-1.5 text-center text-muted-foreground">—</div>}
                    </td>
                  );
                })}
                <td className="p-0.5">
                  <div className={`${getColor(total)} rounded px-2 py-1.5 text-center font-mono font-bold`}>
                    {total > 0 ? '+' : ''}{total.toFixed(1)}%
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RollingSharpeChart() {
  const data = useMemo(() => generateRollingSharpe(), []);
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 14%)" />
          <XAxis dataKey="date" tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 10 }} tickFormatter={v => v.slice(5)} interval={15} />
          <YAxis tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'hsl(220, 25%, 8%)', border: '1px solid hsl(220, 20%, 14%)', borderRadius: '8px', fontSize: '12px' }} />
          <ReferenceLine y={0} stroke="hsl(215, 15%, 30%)" strokeDasharray="3 3" />
          <ReferenceLine y={2} stroke="hsl(145, 70%, 50%)" strokeDasharray="5 5" label={{ value: 'Target', fill: 'hsl(145, 70%, 50%)', fontSize: 10 }} />
          <Line type="monotone" dataKey="sharpe" stroke="hsl(190, 95%, 50%)" strokeWidth={1.5} dot={false} name="Rolling 90d Sharpe" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ReturnDistributionChart() {
  const data = useMemo(() => generateReturnDistribution(), []);
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 14%)" />
          <XAxis dataKey="range" tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 9 }} />
          <YAxis tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'hsl(220, 25%, 8%)', border: '1px solid hsl(220, 20%, 14%)', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="count" name="Frequency" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.midpoint >= 0 ? 'hsl(145, 70%, 50%)' : 'hsl(0, 72%, 55%)'} fillOpacity={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Content({ exchangeFilter: _ }: { exchangeFilter: Exchange | 'all' }) {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-foreground">Performance</h1>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
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
          <div key={m.label} className="rounded-lg border border-border bg-card p-2">
            <div className="text-[10px] text-muted-foreground">{m.label}</div>
            <div className="font-mono text-sm font-bold text-foreground">{m.value}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="equity" className="w-full">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="equity">Equity & Drawdown</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Returns</TabsTrigger>
          <TabsTrigger value="rolling">Rolling Sharpe</TabsTrigger>
          <TabsTrigger value="distribution">Return Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="equity" className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Equity Curve</h2>
            <EquityChart />
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Drawdown</h2>
            <DrawdownChart />
          </div>
        </TabsContent>

        <TabsContent value="monthly">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Monthly Returns Heatmap (QuantStats Style)</h2>
            <MonthlyHeatmap />
          </div>
        </TabsContent>

        <TabsContent value="rolling">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Rolling 90-Day Sharpe Ratio</h2>
            <RollingSharpeChart />
          </div>
        </TabsContent>

        <TabsContent value="distribution">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Daily Return Distribution</h2>
            <ReturnDistributionChart />
          </div>
        </TabsContent>
      </Tabs>
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
