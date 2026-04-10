import { DashboardLayout } from "@/components/DashboardLayout";
import { EquityChart } from "@/components/trading/EquityChart";
import { DrawdownChart } from "@/components/trading/DrawdownChart";
import { MonthlyHeatmap } from "@/components/trading/MonthlyHeatmap";
import { PageTransition } from "@/components/PageTransition";
import { Exchange, mockMonthlyReturns, generateRollingSharpe, generateReturnDistribution } from "@/lib/mock-data";
import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function RollingSharpeChart() {
  const data = useMemo(() => generateRollingSharpe(), []);
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickFormatter={v => v.slice(5)} interval={15} />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
          <ReferenceLine y={2} stroke="hsl(var(--profit))" strokeDasharray="5 5" label={{ value: 'Target', fill: 'hsl(var(--profit))', fontSize: 10 }} />
          <Line type="monotone" dataKey="sharpe" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} name="Rolling 90d Sharpe" />
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
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="range" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
          <Bar dataKey="count" name="Frequency" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.midpoint >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'} fillOpacity={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Content({ exchangeFilter: _ }: { exchangeFilter: Exchange | 'all' }) {
  return (
    <PageTransition>
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-foreground">Performance</h1>

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
          <TabsList className="bg-muted/50 flex-wrap">
            <TabsTrigger value="equity">Equity & Drawdown</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Returns</TabsTrigger>
            <TabsTrigger value="rolling">Rolling Sharpe</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
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
              <MonthlyHeatmap data={mockMonthlyReturns} />
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
