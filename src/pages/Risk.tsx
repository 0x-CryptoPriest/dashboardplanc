import { DashboardLayout } from "@/components/DashboardLayout";
import { RiskPanel } from "@/components/trading/RiskPanel";
import { DrawdownChart } from "@/components/trading/DrawdownChart";
import { Exchange } from "@/lib/mock-data";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const allocationData = [
  { name: 'BTC', value: 45, color: 'hsl(38, 92%, 55%)' },
  { name: 'ETH', value: 25, color: 'hsl(190, 95%, 50%)' },
  { name: 'SOL', value: 15, color: 'hsl(280, 70%, 60%)' },
  { name: 'Others', value: 15, color: 'hsl(215, 15%, 50%)' },
];

function Content({ exchangeFilter: _ }: { exchangeFilter: Exchange | 'all' }) {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-foreground">Risk Analysis</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-card p-4 mb-4">
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
                  {allocationData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(220, 25%, 8%)',
                    border: '1px solid hsl(220, 20%, 14%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {allocationData.map((d) => (
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
