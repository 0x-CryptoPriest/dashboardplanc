import { DashboardLayout } from "@/components/DashboardLayout";
import { Exchange, mockBacktestConfigs, mockBacktestResults, BacktestConfig } from "@/lib/mock-data";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Clock, CheckCircle, XCircle, AlertTriangle, ChevronRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusConfig = {
  COMPLETED: { icon: CheckCircle, color: 'text-profit', bg: 'bg-profit/10' },
  RUNNING: { icon: Play, color: 'text-primary', bg: 'bg-primary/10' },
  FAILED: { icon: XCircle, color: 'text-loss', bg: 'bg-loss/10' },
  QUEUED: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
};

function BacktestCard({ config, isSelected, onClick, delay }: { config: BacktestConfig; isSelected: boolean; onClick: () => void; delay: number }) {
  const { icon: Icon, color, bg } = statusConfig[config.status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className={`rounded-lg border p-3 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground truncate">{config.name}</h3>
        <div className={`flex items-center gap-1 text-xs ${color} ${bg} px-2 py-0.5 rounded-full`}>
          <Icon className="h-3 w-3" />
          {config.status}
        </div>
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Strategy: <span className="text-foreground">{config.strategy}</span></div>
        <div>Period: {config.startDate} → {config.endDate}</div>
        <div className="flex items-center justify-between">
          <span>Capital: ${config.initialCapital.toLocaleString()}</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </motion.div>
  );
}

function MonthlyHeatmap({ data }: { data: { year: number; month: number; return: number }[] }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = [...new Set(data.map(d => d.year))];

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
            <th className="text-left text-muted-foreground p-1">Year</th>
            {months.map(m => <th key={m} className="text-center text-muted-foreground p-1">{m}</th>)}
            <th className="text-center text-muted-foreground p-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {years.map(year => {
            const yearData = data.filter(d => d.year === year);
            const total = yearData.reduce((s, d) => s + d.return, 0);
            return (
              <tr key={year}>
                <td className="text-muted-foreground font-mono p-1">{year}</td>
                {months.map((_, mi) => {
                  const d = yearData.find(r => r.month === mi + 1);
                  return (
                    <td key={mi} className="p-0.5">
                      {d ? (
                        <div className={`${getColor(d.return)} rounded px-1 py-1 text-center font-mono`}>
                          {d.return > 0 ? '+' : ''}{d.return.toFixed(1)}%
                        </div>
                      ) : <div className="bg-muted/30 rounded px-1 py-1 text-center text-muted-foreground">—</div>}
                    </td>
                  );
                })}
                <td className="p-0.5">
                  <div className={`${getColor(total)} rounded px-1 py-1 text-center font-mono font-bold`}>
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

function Content({ exchangeFilter }: { exchangeFilter: Exchange | 'all' }) {
  const [selectedId, setSelectedId] = useState<string>('bt1');
  const configs = exchangeFilter === 'all' ? mockBacktestConfigs : mockBacktestConfigs.filter(c => c.exchange === exchangeFilter);
  const result = mockBacktestResults[selectedId];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-foreground">Backtesting</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: backtest list */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Backtest Runs</h2>
          {configs.map((c, i) => (
            <BacktestCard key={c.id} config={c} isSelected={selectedId === c.id} onClick={() => setSelectedId(c.id)} delay={i * 0.05} />
          ))}
        </div>

        {/* Right: results */}
        <div className="lg:col-span-3 space-y-4">
          {result ? (
            <>
              {/* Key metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {[
                  { label: 'Total Return', value: `+${result.totalReturn}%` },
                  { label: 'Annualized', value: `+${result.annualizedReturn}%` },
                  { label: 'Sharpe', value: result.sharpeRatio.toFixed(2) },
                  { label: 'Sortino', value: result.sortinoRatio.toFixed(2) },
                  { label: 'Max DD', value: `${result.maxDrawdown}%` },
                  { label: 'Win Rate', value: `${result.winRate}%` },
                  { label: 'Trades', value: result.totalTrades.toString() },
                  { label: 'Profit Factor', value: result.profitFactor.toFixed(1) },
                  { label: 'Avg Trade', value: `$${result.avgTrade}` },
                  { label: 'Calmar', value: result.calmarRatio.toFixed(1) },
                  { label: 'Volatility', value: `${result.volatility}%` },
                  { label: 'Trades/Day', value: (result.totalTrades / 440).toFixed(1) },
                ].map(m => (
                  <div key={m.label} className="rounded-lg border border-border bg-card p-2">
                    <div className="text-[10px] text-muted-foreground">{m.label}</div>
                    <div className="font-mono text-sm font-bold text-foreground">{m.value}</div>
                  </div>
                ))}
              </div>

              <Tabs defaultValue="equity" className="w-full">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="equity">Equity Curve</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly Returns</TabsTrigger>
                  <TabsTrigger value="trades">Trade Log</TabsTrigger>
                </TabsList>

                <TabsContent value="equity">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.equityCurve}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 14%)" />
                          <XAxis dataKey="date" tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 10 }} tickFormatter={v => v.slice(5)} interval={Math.floor(result.equityCurve.length / 8)} />
                          <YAxis tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                          <Tooltip contentStyle={{ background: 'hsl(220, 25%, 8%)', border: '1px solid hsl(220, 20%, 14%)', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                          <Legend />
                          <Line type="monotone" dataKey="equity" stroke="hsl(190, 95%, 50%)" strokeWidth={2} dot={false} name="Strategy" />
                          <Line type="monotone" dataKey="benchmark" stroke="hsl(215, 15%, 50%)" strokeWidth={1} dot={false} strokeDasharray="5 5" name="Benchmark" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="monthly">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <MonthlyHeatmap data={result.monthlyReturns} />
                  </div>
                </TabsContent>

                <TabsContent value="trades">
                  <div className="rounded-lg border border-border bg-card p-4 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          {['Symbol', 'Side', 'Entry', 'Exit', 'Entry $', 'Exit $', 'Qty', 'PnL', 'PnL %', 'Duration'].map(h => (
                            <th key={h} className="text-left text-muted-foreground py-2 px-2 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.trades.map(t => (
                          <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-1.5 px-2 font-mono text-foreground">{t.symbol}</td>
                            <td className={`py-1.5 px-2 font-mono ${t.side === 'BUY' ? 'text-profit' : 'text-loss'}`}>{t.side}</td>
                            <td className="py-1.5 px-2 text-muted-foreground">{t.entryTime}</td>
                            <td className="py-1.5 px-2 text-muted-foreground">{t.exitTime}</td>
                            <td className="py-1.5 px-2 font-mono text-foreground">${t.entryPrice.toLocaleString()}</td>
                            <td className="py-1.5 px-2 font-mono text-foreground">${t.exitPrice.toLocaleString()}</td>
                            <td className="py-1.5 px-2 font-mono text-foreground">{t.quantity}</td>
                            <td className={`py-1.5 px-2 font-mono ${t.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>${t.pnl.toLocaleString()}</td>
                            <td className={`py-1.5 px-2 font-mono ${t.pnlPercent >= 0 ? 'text-profit' : 'text-loss'}`}>{t.pnlPercent > 0 ? '+' : ''}{t.pnlPercent}%</td>
                            <td className="py-1.5 px-2 text-muted-foreground">{t.holdingPeriod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-warning" />
              <p>Select a completed backtest to view results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BacktestPage() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <Content exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
