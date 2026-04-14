import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { SkeletonCards, SkeletonChart, SkeletonTable } from "@/components/SkeletonDashboard";
import { MonthlyHeatmap } from "@/components/trading/MonthlyHeatmap";
import {
  BacktestConfig,
  BacktestResult,
  DataSource,
  Exchange,
  StrategyCatalog,
  createBacktest,
  fetchBacktestResult,
  fetchBacktests,
  fetchDataSources,
  fetchStrategyCatalog,
} from "@/lib/planc-api";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Play, Clock, CheckCircle, XCircle, AlertTriangle, ChevronRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusConfig = {
  COMPLETED: { icon: CheckCircle, color: "text-profit", bg: "bg-profit/10" },
  RUNNING: { icon: Play, color: "text-primary", bg: "bg-primary/10" },
  FAILED: { icon: XCircle, color: "text-loss", bg: "bg-loss/10" },
  QUEUED: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
};

const timeframePriority: Record<string, number> = {
  "1m": 1,
  "5m": 2,
  "15m": 3,
  "30m": 4,
  "1h": 5,
  "4h": 6,
  "1d": 7,
};

type BacktestFormState = {
  strategyId: string;
  exchange: Exchange;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialCapital: string;
};

const defaultEndDate = new Date().toISOString().slice(0, 10);
const defaultStartDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

function normalizeDate(value: string | undefined): string {
  if (!value || value === "N/A") {
    return "";
  }
  return value.slice(0, 10);
}

function buildDefaultStrategyConfig(strategy: StrategyCatalog | undefined): Record<string, number> {
  if (!strategy) {
    return {};
  }

  const schema = strategy.paramsSchema;
  const required = Array.isArray(schema.required) ? schema.required : [];
  const properties =
    schema.properties && typeof schema.properties === "object"
      ? (schema.properties as Record<string, Record<string, unknown>>)
      : {};

  const payload: Record<string, number> = {};
  for (const key of required) {
    if (typeof key !== "string") {
      continue;
    }
    const rule = properties[key];
    if (!rule) {
      continue;
    }

    if (rule.type === "integer") {
      if (typeof rule.default === "number") {
        payload[key] = Math.round(rule.default);
        continue;
      }
      const minimum = typeof rule.minimum === "number" ? Math.ceil(rule.minimum) : 2;
      payload[key] = Math.max(minimum, 2);
      continue;
    }
    if (rule.type === "number") {
      if (typeof rule.default === "number") {
        payload[key] = rule.default;
        continue;
      }
      const base = typeof rule.exclusiveMinimum === "number" ? rule.exclusiveMinimum : 0;
      payload[key] = Math.max(base + 0.01, 0.01);
    }
  }
  return payload;
}

function strategyStatusLabel(status: StrategyCatalog["status"]): string {
  if (status === "RUNNING") return "RUNNING";
  if (status === "STOPPED") return "STOPPED";
  return "ERROR";
}

function BacktestCard({
  config,
  isSelected,
  onClick,
  delay,
}: {
  config: BacktestConfig;
  isSelected: boolean;
  onClick: () => void;
  delay: number;
}) {
  const { icon: Icon, color, bg } = statusConfig[config.status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-lg border p-3 cursor-pointer transition-all ${
        isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
      }`}
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
        <div>
          Strategy: <span className="text-foreground">{config.strategy}</span>
        </div>
        <div>
          Market:{" "}
          <span className="text-foreground font-mono">
            {config.symbol} · {config.timeframe}
          </span>
        </div>
        <div>
          Period: {config.startDate} → {config.endDate}
        </div>
        <div className="flex items-center justify-between">
          <span>Capital: ${config.initialCapital.toLocaleString()}</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </motion.div>
  );
}

function Content({ exchangeFilter }: { exchangeFilter: Exchange | "all" }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [configs, setConfigs] = useState<BacktestConfig[]>([]);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [strategies, setStrategies] = useState<StrategyCatalog[]>([]);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [isContextLoading, setIsContextLoading] = useState(true);
  const [isResultLoading, setIsResultLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<BacktestFormState>({
    strategyId: "",
    exchange: exchangeFilter === "all" ? "binance" : exchangeFilter,
    symbol: "",
    timeframe: "1h",
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    initialCapital: "100000",
  });

  const loadBacktestContext = async (currentExchangeFilter: Exchange | "all") => {
    setIsContextLoading(true);
    setError(null);
    try {
      const [runData, sourceData, strategyData] = await Promise.all([
        fetchBacktests(),
        fetchDataSources(),
        fetchStrategyCatalog(),
      ]);

      setConfigs(runData);
      setSources(sourceData);
      setStrategies(strategyData);
      setSelectedId(runData[0]?.id ?? "");

      const desiredExchange = currentExchangeFilter === "all" ? "binance" : currentExchangeFilter;
      const desiredSourceId = desiredExchange === "binance" ? "d1" : "d2";
      const source = sourceData.find((item) => item.id === desiredSourceId);
      const sourceSymbols = source?.instruments ?? [];
      const sourceTimeframes = [...(source?.timeframes ?? [])].sort(
        (a, b) => (timeframePriority[a] ?? 99) - (timeframePriority[b] ?? 99),
      );

      setForm((previous) => ({
        ...previous,
        exchange: desiredExchange,
        strategyId: strategyData[0]?.id ?? "",
        symbol: sourceSymbols[0] ?? "",
        timeframe: sourceTimeframes[0] ?? "1h",
        startDate: normalizeDate(source?.coverage.from) || defaultStartDate,
        endDate: normalizeDate(source?.coverage.to) || defaultEndDate,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load backtest context");
    } finally {
      setIsContextLoading(false);
    }
  };

  const loadBacktestResult = async (backtestId: string) => {
    if (!backtestId) {
      setResult(null);
      return;
    }
    setIsResultLoading(true);
    try {
      const data = await fetchBacktestResult(backtestId);
      setResult(data);
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "failed to load backtest result");
    } finally {
      setIsResultLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!isMounted) {
        return;
      }
      await loadBacktestContext(exchangeFilter);
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [exchangeFilter]);

  useEffect(() => {
    if (exchangeFilter === "all") {
      return;
    }
    setForm((previous) => ({ ...previous, exchange: exchangeFilter }));
  }, [exchangeFilter]);

  const exchangeSource = useMemo(
    () => sources.find((item) => item.id === (form.exchange === "binance" ? "d1" : "d2")),
    [sources, form.exchange],
  );

  const availableSymbols = useMemo(
    () => [...(exchangeSource?.instruments ?? [])].sort(),
    [exchangeSource],
  );

  const availableTimeframes = useMemo(
    () =>
      [...(exchangeSource?.timeframes ?? [])].sort(
        (a, b) => (timeframePriority[a] ?? 99) - (timeframePriority[b] ?? 99),
      ),
    [exchangeSource],
  );

  useEffect(() => {
    if (availableSymbols.length === 0) {
      return;
    }
    if (!availableSymbols.includes(form.symbol)) {
      setForm((previous) => ({ ...previous, symbol: availableSymbols[0] }));
    }
  }, [availableSymbols, form.symbol]);

  useEffect(() => {
    if (availableTimeframes.length === 0) {
      return;
    }
    if (!availableTimeframes.includes(form.timeframe)) {
      setForm((previous) => ({ ...previous, timeframe: availableTimeframes[0] }));
    }
  }, [availableTimeframes, form.timeframe]);

  useEffect(() => {
    if (!selectedId) {
      setResult(null);
      return;
    }
    let isMounted = true;
    const load = async () => {
      if (!isMounted) {
        return;
      }
      await loadBacktestResult(selectedId);
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  const filteredConfigs = useMemo(
    () =>
      exchangeFilter === "all" ? configs : configs.filter((item) => item.exchange === exchangeFilter),
    [configs, exchangeFilter],
  );

  const runBacktest = async () => {
    if (!form.strategyId || !form.symbol || !form.timeframe) {
      setError("Please choose strategy, symbol and timeframe before running backtest.");
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError("Please choose start and end dates.");
      return;
    }
    const initialCapital = Number(form.initialCapital);
    if (!Number.isFinite(initialCapital) || initialCapital <= 0) {
      setError("Initial capital must be a positive number.");
      return;
    }
    if (form.startDate > form.endDate) {
      setError("Start date must be earlier than end date.");
      return;
    }

    setRunning(true);
    setIsResultLoading(true);
    setError(null);
    try {
      const selectedStrategy = strategies.find((item) => item.id === form.strategyId);
      const strategyConfig = buildDefaultStrategyConfig(selectedStrategy);
      const created = await createBacktest({
        strategy_id: form.strategyId,
        exchange: form.exchange,
        symbol: form.symbol,
        timeframe: form.timeframe,
        start_date: form.startDate,
        end_date: form.endDate,
        initial_capital: initialCapital,
        strategy_config: strategyConfig,
      });

      const [updatedConfigs, createdResult] = await Promise.all([
        fetchBacktests(),
        fetchBacktestResult(created.id),
      ]);

      setConfigs(updatedConfigs);
      setSelectedId(created.id);
      setResult(createdResult);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to run backtest");
    } finally {
      setRunning(false);
      setIsResultLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">Backtesting</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure strategy + symbol + timeframe + period, then run a real backtest on local
            market data.
          </p>
        </div>
        {error ? (
          <div className="rounded-lg border border-loss/30 bg-loss/10 p-3 flex items-center justify-between gap-3">
            <p className="text-sm text-loss">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void loadBacktestContext(exchangeFilter)}>
              Retry
            </Button>
          </div>
        ) : null}

        {isContextLoading ? (
          <SkeletonCards count={4} />
        ) : (
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Strategy</Label>
                <Select
                  value={form.strategyId}
                  onValueChange={(value) => setForm((previous) => ({ ...previous, strategyId: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {strategies.map((strategy) => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.name} · {strategyStatusLabel(strategy.status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Exchange</Label>
                <Select
                  value={form.exchange}
                  onValueChange={(value: Exchange) =>
                    setForm((previous) => ({ ...previous, exchange: value }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="binance">Binance</SelectItem>
                    <SelectItem value="hyperliquid">Hyperliquid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Symbol</Label>
                <Select
                  value={form.symbol}
                  onValueChange={(value) => setForm((previous) => ({ ...previous, symbol: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSymbols.map((symbol) => (
                      <SelectItem key={symbol} value={symbol}>
                        {symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Timeframe</Label>
                <Select
                  value={form.timeframe}
                  onValueChange={(value) => setForm((previous) => ({ ...previous, timeframe: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeframes.map((timeframe) => (
                      <SelectItem key={timeframe} value={timeframe}>
                        {timeframe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, startDate: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">End Date</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, endDate: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Initial Capital</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.initialCapital}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, initialCapital: event.target.value }))
                  }
                />
              </div>
              <div className="flex items-end">
                <Button onClick={runBacktest} disabled={running} className="w-full">
                  {running ? "Running..." : "Run Backtest"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">Backtest Runs</h2>
            {isContextLoading ? (
              <SkeletonCards count={3} />
            ) : filteredConfigs.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">
                No backtest runs yet for current filter.
              </div>
            ) : (
              filteredConfigs.map((config, index) => (
                <BacktestCard
                  key={config.id}
                  config={config}
                  isSelected={selectedId === config.id}
                  onClick={() => setSelectedId(config.id)}
                  delay={index * 0.05}
                />
              ))
            )}
          </div>

          <div className="lg:col-span-3 space-y-4">
            {isResultLoading ? (
              <>
                <SkeletonCards count={6} />
                <SkeletonChart height="h-[350px]" />
                <SkeletonTable rows={8} />
              </>
            ) : result ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {[
                    {
                      label: "Total Return",
                      value: `${result.totalReturn > 0 ? "+" : ""}${result.totalReturn}%`,
                    },
                    {
                      label: "Annualized",
                      value: `${result.annualizedReturn > 0 ? "+" : ""}${result.annualizedReturn}%`,
                    },
                    { label: "Sharpe", value: result.sharpeRatio.toFixed(2) },
                    { label: "Sortino", value: result.sortinoRatio.toFixed(2) },
                    { label: "Max DD", value: `${result.maxDrawdown}%` },
                    { label: "Win Rate", value: `${result.winRate}%` },
                    { label: "Trades", value: result.totalTrades.toString() },
                    { label: "Profit Factor", value: result.profitFactor.toFixed(1) },
                    { label: "Avg Trade", value: `$${result.avgTrade}` },
                    { label: "Calmar", value: result.calmarRatio.toFixed(1) },
                    { label: "Volatility", value: `${result.volatility}%` },
                    {
                      label: "Trades/Bar",
                      value: (result.totalTrades / Math.max(1, result.equityCurve.length)).toFixed(3),
                    },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-lg border border-border bg-card p-2">
                      <div className="text-[10px] text-muted-foreground">{metric.label}</div>
                      <div className="font-mono text-sm font-bold text-foreground">{metric.value}</div>
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
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                              dataKey="date"
                              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                              tickFormatter={(value) => String(value).slice(0, 10)}
                              interval={Math.max(1, Math.floor(result.equityCurve.length / 8))}
                            />
                            <YAxis
                              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                fontSize: "12px",
                              }}
                              formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="equity"
                              stroke="hsl(var(--primary))"
                              strokeWidth={2}
                              dot={false}
                              name="Strategy"
                            />
                            <Line
                              type="monotone"
                              dataKey="benchmark"
                              stroke="hsl(var(--muted-foreground))"
                              strokeWidth={1}
                              dot={false}
                              strokeDasharray="5 5"
                              name="Benchmark"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="monthly">
                    <div className="rounded-lg border border-border bg-card p-4">
                      <MonthlyHeatmap data={result.monthlyReturns} compact />
                    </div>
                  </TabsContent>

                  <TabsContent value="trades">
                    <div className="rounded-lg border border-border bg-card p-4 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border">
                            {[
                              "Symbol",
                              "Side",
                              "Entry",
                              "Exit",
                              "Entry $",
                              "Exit $",
                              "Qty",
                              "PnL",
                              "PnL %",
                              "Duration",
                            ].map((header) => (
                              <th
                                key={header}
                                className="text-left text-muted-foreground py-2 px-2 font-medium"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.trades.map((trade) => (
                            <tr key={trade.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="py-1.5 px-2 font-mono text-foreground">{trade.symbol}</td>
                              <td
                                className={`py-1.5 px-2 font-mono ${
                                  trade.side === "BUY" ? "text-profit" : "text-loss"
                                }`}
                              >
                                {trade.side}
                              </td>
                              <td className="py-1.5 px-2 text-muted-foreground">{trade.entryTime}</td>
                              <td className="py-1.5 px-2 text-muted-foreground">{trade.exitTime}</td>
                              <td className="py-1.5 px-2 font-mono text-foreground">
                                ${trade.entryPrice.toLocaleString()}
                              </td>
                              <td className="py-1.5 px-2 font-mono text-foreground">
                                ${trade.exitPrice.toLocaleString()}
                              </td>
                              <td className="py-1.5 px-2 font-mono text-foreground">
                                {trade.quantity}
                              </td>
                              <td
                                className={`py-1.5 px-2 font-mono ${
                                  trade.pnl >= 0 ? "text-profit" : "text-loss"
                                }`}
                              >
                                ${trade.pnl.toLocaleString()}
                              </td>
                              <td
                                className={`py-1.5 px-2 font-mono ${
                                  trade.pnlPercent >= 0 ? "text-profit" : "text-loss"
                                }`}
                              >
                                {trade.pnlPercent > 0 ? "+" : ""}
                                {trade.pnlPercent}%
                              </td>
                              <td className="py-1.5 px-2 text-muted-foreground">{trade.holdingPeriod}</td>
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
                <p>Run a backtest or select one from the left panel to view results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default function BacktestPage() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <Content exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
