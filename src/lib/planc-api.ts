import type { SystemHealthSnapshot, SystemLogsSnapshot } from "@/lib/system-health";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000";
const DASHBOARD_SESSION_ID =
  (import.meta.env.VITE_DASHBOARD_SESSION_ID as string | undefined) ?? "dashboard-session";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string | null;
};

export type Exchange = "binance" | "hyperliquid";

export type AccountSummary = {
  exchange: Exchange;
  totalEquity: number;
  spotEquity: number;
  futuresEquity: number;
  availableBalance: number;
  unrealizedPnl: number;
  dailyPnl: number;
  dailyPnlPercent: number;
  marginUsed: number;
  marginRatio: number;
};

export type Position = {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  leverage: number;
  exchange: Exchange;
  strategy: string;
};

export type Order = {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: "LIMIT" | "MARKET" | "STOP" | "STOP_LIMIT";
  price: number;
  quantity: number;
  filled: number;
  status: "OPEN" | "PARTIAL" | "FILLED" | "CANCELLED";
  exchange: Exchange;
  strategy: string;
  time: string;
};

export type Strategy = {
  id: string;
  name: string;
  status: "RUNNING" | "STOPPED" | "ERROR";
  exchange: Exchange;
  instruments: string[];
  pnlToday: number;
  pnlTotal: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
  lastSignal: string;
  lastSignalTime: string;
};

export type EquityPoint = {
  date: string;
  equity: number;
  benchmark: number;
};

export type DrawdownPoint = {
  date: string;
  drawdown: number;
};

export type MonthlyReturn = {
  year: number;
  month: number;
  return: number;
};

export type RollingSharpePoint = {
  date: string;
  sharpe: number;
};

export type ReturnDistributionBucket = {
  range: string;
  midpoint: number;
  count: number;
};

export type PerformanceSummary = {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  avgTrade: number;
};

export type RiskMetric = {
  label: string;
  value: number | string;
  status: "good" | "warning" | "danger";
};

export type AllocationSlice = {
  name: string;
  value: number;
};

export type OptimizedAllocation = {
  name: string;
  current: number;
  optimal: number;
};

export type RiskAllocation = {
  current: AllocationSlice[];
  optimized: OptimizedAllocation[];
  recommendation: string;
};

export type CorrelationPair = {
  asset1: string;
  asset2: string;
  correlation: number;
};

export type EfficientFrontierPoint = {
  risk: number;
  return: number;
  label?: string;
  isCurrent?: boolean;
  isOptimal?: boolean;
};

export type BacktestConfig = {
  id: string;
  name: string;
  strategyId: string;
  strategy: string;
  exchange: Exchange;
  symbol: string;
  timeframe: string;
  instruments: string[];
  startDate: string;
  endDate: string;
  initialCapital: number;
  status: "COMPLETED" | "RUNNING" | "FAILED" | "QUEUED";
  createdAt: string;
};

export type BacktestCreatePayload = {
  strategy_id: string;
  exchange: Exchange;
  symbol: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  strategy_config?: Record<string, number>;
};

export type BacktestTrade = {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  holdingPeriod: string;
};

export type BacktestResult = {
  configId: string;
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  avgTrade: number;
  calmarRatio: number;
  volatility: number;
  equityCurve: EquityPoint[];
  trades: BacktestTrade[];
  monthlyReturns: MonthlyReturn[];
};

export type DagsterLog = {
  timestamp: string;
  level: "INFO" | "WARNING" | "ERROR" | "DEBUG";
  message: string;
  step?: string;
};

export type DagsterJob = {
  id: string;
  name: string;
  description: string;
  status: "SUCCESS" | "RUNNING" | "FAILED" | "QUEUED" | "CANCELLED";
  schedule: string;
  lastRun: string;
  duration: string;
  nextRun: string;
  tags: string[];
  upstream: string[];
  downstream: string[];
};

export type DagsterRun = {
  id: string;
  jobId: string;
  jobName: string;
  status: "SUCCESS" | "RUNNING" | "FAILED" | "CANCELLED";
  startTime: string;
  endTime: string;
  duration: string;
  logs: DagsterLog[];
};

export type DataSource = {
  id: string;
  name: string;
  type: "exchange" | "parquet" | "duckdb" | "api";
  status: "CONNECTED" | "DISCONNECTED" | "ERROR" | "SYNCING";
  lastSync: string;
  recordCount: number;
  sizeBytes: number;
  instruments: string[];
  timeframes: string[];
  coverage: { from: string; to: string };
  quality: { completeness: number; gaps: number; latency: string };
};

export type ApiKeyRecord = {
  id: string;
  name: string;
  exchange: Exchange;
  status: "active" | "expired" | "error";
  maskedKey: string;
  lastUsed: string;
  isTestnet: boolean;
  hasSecret: boolean;
};

export type ApiKeyPayload = {
  id?: string;
  name: string;
  exchange: Exchange;
  isTestnet: boolean;
  apiKey?: string;
  apiSecret?: string;
};

export type ConnectionHealth = {
  name: string;
  endpoint: string;
  latency: string;
  status: "healthy" | "degraded" | "down";
};

export type SystemInfo = {
  label: string;
  value: string;
};

export type NotificationPreference = {
  key: string;
  enabled: boolean;
};

type BackendAccount = {
  account_id: string;
  exchange: Exchange;
  label: string;
  is_testnet: boolean;
  status: string;
};

type BackendOrder = {
  order_id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  status: string;
  notional: number;
  exchange?: Exchange;
};

type BackendPosition = {
  symbol: string;
  quantity: number;
  avg_price: number;
  exchange?: Exchange;
};

type BackendStrategy = {
  strategy_id: string;
  display_name: string;
  params_schema?: Record<string, unknown>;
  exchange?: Exchange;
  status?: string;
};

type BackendAccountSnapshot = {
  account_id: string;
  exchange: Exchange;
  equity: number;
  equity_breakdown?: Record<string, number>;
  open_order_count: number;
  positions: Record<string, number>;
};

export type StrategyCatalog = {
  id: string;
  name: string;
  paramsSchema: Record<string, unknown>;
};

type BackendSessionStatus = {
  session_id: string;
  status: "created" | "running" | "stopped";
  mode: "paper" | "live" | "hft";
  equity: number;
  profit: number;
  profit_ratio: number;
};

type BackendLiveRisk = {
  max_order_notional: number;
  max_position_notional: number;
  max_open_orders: number;
  max_orders_per_minute: number;
  max_daily_loss: number;
};

let bootstrapPromise: Promise<void> | null = null;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  const payload = (await response.json()) as ApiEnvelope<T> | { detail?: string };

  if (!response.ok) {
    const detail =
      "detail" in payload && typeof payload.detail === "string"
        ? payload.detail
        : `request failed (${response.status})`;
    throw new Error(detail);
  }

  if (!("success" in payload) || payload.success !== true) {
    throw new Error("unexpected API response shape");
  }

  return payload.data;
}

async function createSessionIfNeeded(): Promise<void> {
  try {
    await request<{ session_id: string }>("/v1/trading/sessions", {
      method: "POST",
      body: JSON.stringify({
        session_id: DASHBOARD_SESSION_ID,
        initial_cash: 100000,
        mode: "paper",
        allow_trading: false,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("already exists")) {
      throw error;
    }
  }
}

async function startSessionIfNeeded(): Promise<void> {
  try {
    await request<{ status: string }>(`/v1/trading/sessions/${DASHBOARD_SESSION_ID}/start`, {
      method: "POST",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("already") && !message.includes("running")) {
      throw error;
    }
  }
}

export async function bootstrapDashboardSession(): Promise<void> {
  if (bootstrapPromise !== null) {
    return bootstrapPromise;
  }

  bootstrapPromise = (async () => {
    await createSessionIfNeeded();
    await startSessionIfNeeded();
  })();

  try {
    await bootstrapPromise;
  } catch (error) {
    bootstrapPromise = null;
    throw error;
  }
}

function normalizeExchange(value: string | undefined, fallback: Exchange): Exchange {
  if (value === "hyperliquid") {
    return "hyperliquid";
  }
  return value === "binance" ? "binance" : fallback;
}

function normalizeStrategyStatus(value: string | undefined): Strategy["status"] {
  const normalized = value?.toUpperCase();
  if (normalized === "STOPPED") {
    return "STOPPED";
  }
  if (normalized === "ERROR") {
    return "ERROR";
  }
  return "RUNNING";
}

function resolveExchange(accounts: BackendAccount[]): Exchange {
  return accounts[0]?.exchange ?? "binance";
}

export async function fetchAccounts(): Promise<BackendAccount[]> {
  await bootstrapDashboardSession();
  return request<BackendAccount[]>("/v1/trading/accounts");
}

export async function fetchAccountSnapshot(accountId: string): Promise<BackendAccountSnapshot> {
  await bootstrapDashboardSession();
  return request<BackendAccountSnapshot>(`/v1/trading/accounts/${accountId}/snapshot`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function fetchAccountSnapshotWithRetry(
  accountId: string,
  attempts = 3,
): Promise<BackendAccountSnapshot> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetchAccountSnapshot(accountId);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < attempts) {
        await sleep(300 * attempt);
      }
    }
  }
  throw lastError ?? new Error("failed to fetch account snapshot");
}

export async function fetchSessionStatus(): Promise<BackendSessionStatus> {
  await bootstrapDashboardSession();
  return request<BackendSessionStatus>(`/v1/trading/sessions/${DASHBOARD_SESSION_ID}/status`);
}

export async function fetchOrders(): Promise<BackendOrder[]> {
  await bootstrapDashboardSession();
  return request<BackendOrder[]>(`/v1/trading/sessions/${DASHBOARD_SESSION_ID}/orders`);
}

export async function fetchPositions(): Promise<BackendPosition[]> {
  await bootstrapDashboardSession();
  return request<BackendPosition[]>(`/v1/trading/sessions/${DASHBOARD_SESSION_ID}/positions`);
}

export async function fetchStrategies(): Promise<BackendStrategy[]> {
  await bootstrapDashboardSession();
  return request<BackendStrategy[]>("/v1/trading/strategies");
}

export async function fetchStrategyCatalog(): Promise<StrategyCatalog[]> {
  const strategies = await request<BackendStrategy[]>("/v1/trading/strategies");
  return strategies.map((strategy) => ({
    id: strategy.strategy_id,
    name: strategy.display_name,
    paramsSchema: strategy.params_schema ?? {},
  }));
}

export async function fetchRiskMetrics(): Promise<RiskMetric[]> {
  return request<RiskMetric[]>("/v1/risk/metrics");
}

export async function fetchDashboardSnapshot(): Promise<{
  accounts: Record<Exchange, AccountSummary>;
  positions: Position[];
  orders: Order[];
  strategies: Strategy[];
}> {
  const [accounts, status, positions, orders, strategies] = await Promise.all([
    fetchAccounts(),
    fetchSessionStatus(),
    fetchPositions(),
    fetchOrders(),
    fetchStrategies(),
  ]);

  const fallbackExchange = resolveExchange(accounts);

  const accountSummaries: Record<Exchange, AccountSummary> = {
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
  };

  const activeAccounts = accounts.filter((account) => account.status === "active");
  const snapshotErrors: string[] = [];
  const snapshots = await Promise.all(
    activeAccounts.map(async (account) => {
      try {
        const snapshot = await fetchAccountSnapshotWithRetry(account.account_id);
        return {
          accountId: account.account_id,
          exchange: account.exchange,
          snapshot,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        snapshotErrors.push(`${account.account_id}: ${message}`);
        return null;
      }
    }),
  );

  const snapshotByExchange = new Map<Exchange, BackendAccountSnapshot>();
  for (const item of snapshots) {
    if (!item) {
      continue;
    }
    if (snapshotByExchange.has(item.exchange)) {
      continue;
    }
    snapshotByExchange.set(item.exchange, item.snapshot);
  }

  for (const account of activeAccounts) {
    const accountSnapshot = snapshotByExchange.get(account.exchange);
    if (!accountSnapshot) {
      continue;
    }

    const breakdown = accountSnapshot.equity_breakdown ?? {};
    const spotEquity = Number(breakdown.spot ?? 0);
    const futuresEquity = Number((breakdown.futures ?? 0) + (breakdown.delivery ?? 0));
    const marginEquity = Number(breakdown.margin ?? 0);
    const computedTotal = spotEquity + futuresEquity + marginEquity;
    const totalEquity = computedTotal > 0 ? computedTotal : accountSnapshot.equity;

    accountSummaries[account.exchange] = {
      exchange: account.exchange,
      totalEquity,
      spotEquity,
      futuresEquity,
      availableBalance: totalEquity,
      unrealizedPnl: 0,
      dailyPnl: 0,
      dailyPnlPercent: 0,
      marginUsed: 0,
      marginRatio: 0,
    };
  }

  if (activeAccounts.length > 0 && snapshotByExchange.size === 0) {
    const detail =
      snapshotErrors.length > 0 ? snapshotErrors.join(" | ") : "unknown snapshot failure";
    throw new Error(`failed to load live account balances: ${detail}`);
  }

  if (activeAccounts.length === 0) {
    accountSummaries[fallbackExchange] = {
      exchange: fallbackExchange,
      totalEquity: status.equity,
      spotEquity: status.equity,
      futuresEquity: 0,
      availableBalance: status.equity,
      unrealizedPnl: status.profit,
      dailyPnl: status.profit,
      dailyPnlPercent: status.profit_ratio * 100,
      marginUsed: 0,
      marginRatio: 0,
    };
  }

  const mappedPositions: Position[] = positions.map((position, index) => ({
    id: `${position.symbol}-${index}`,
    symbol: position.symbol,
    side: position.quantity >= 0 ? "LONG" : "SHORT",
    size: Math.abs(position.quantity),
    entryPrice: position.avg_price,
    markPrice: position.avg_price,
    unrealizedPnl: 0,
    unrealizedPnlPercent: 0,
    leverage: 1,
    exchange: normalizeExchange(position.exchange, fallbackExchange),
    strategy: "session",
  }));

  const mappedOrders: Order[] = orders.map((order) => {
    const normalizedStatus = order.status.toUpperCase();
    const statusValue: Order["status"] =
      normalizedStatus === "FILLED"
        ? "FILLED"
        : normalizedStatus === "OPEN"
          ? "OPEN"
          : normalizedStatus === "PARTIAL"
            ? "PARTIAL"
            : "CANCELLED";

    return {
      id: order.order_id,
      symbol: order.symbol,
      side: order.side === "buy" ? "BUY" : "SELL",
      type: "MARKET",
      price: order.price,
      quantity: order.quantity,
      filled: statusValue === "FILLED" ? order.quantity : 0,
      status: statusValue,
      exchange: normalizeExchange(order.exchange, fallbackExchange),
      strategy: "session",
      time: "—",
    };
  });

  const mappedStrategies: Strategy[] = strategies.map((strategy) => ({
    id: strategy.strategy_id,
    name: strategy.display_name,
    status: normalizeStrategyStatus(strategy.status),
    exchange: normalizeExchange(strategy.exchange, fallbackExchange),
    instruments: [],
    pnlToday: status.profit,
    pnlTotal: status.profit,
    sharpeRatio: 0,
    maxDrawdown: 0,
    winRate: 0,
    trades: mappedOrders.length,
    lastSignal: "N/A",
    lastSignalTime: "—",
  }));

  return {
    accounts: accountSummaries,
    positions: mappedPositions,
    orders: mappedOrders,
    strategies: mappedStrategies,
  };
}

export async function fetchPositionsView(): Promise<Position[]> {
  const [accounts, positions] = await Promise.all([fetchAccounts(), fetchPositions()]);
  const fallbackExchange = resolveExchange(accounts);
  return positions.map((position, index) => ({
    id: `${position.symbol}-${index}`,
    symbol: position.symbol,
    side: position.quantity >= 0 ? "LONG" : "SHORT",
    size: Math.abs(position.quantity),
    entryPrice: position.avg_price,
    markPrice: position.avg_price,
    unrealizedPnl: 0,
    unrealizedPnlPercent: 0,
    leverage: 1,
    exchange: normalizeExchange(position.exchange, fallbackExchange),
    strategy: "session",
  }));
}

export async function fetchOrdersView(): Promise<Order[]> {
  const [accounts, orders] = await Promise.all([fetchAccounts(), fetchOrders()]);
  const fallbackExchange = resolveExchange(accounts);
  return orders.map((order) => {
    const normalizedStatus = order.status.toUpperCase();
    const statusValue: Order["status"] =
      normalizedStatus === "FILLED"
        ? "FILLED"
        : normalizedStatus === "OPEN"
          ? "OPEN"
          : normalizedStatus === "PARTIAL"
            ? "PARTIAL"
            : "CANCELLED";

    return {
      id: order.order_id,
      symbol: order.symbol,
      side: order.side === "buy" ? "BUY" : "SELL",
      type: "MARKET",
      price: order.price,
      quantity: order.quantity,
      filled: statusValue === "FILLED" ? order.quantity : 0,
      status: statusValue,
      exchange: normalizeExchange(order.exchange, fallbackExchange),
      strategy: "session",
      time: "—",
    };
  });
}

export async function fetchStrategiesView(): Promise<Strategy[]> {
  const [accounts, status, strategies, orders] = await Promise.all([
    fetchAccounts(),
    fetchSessionStatus(),
    fetchStrategies(),
    fetchOrders(),
  ]);
  const fallbackExchange = resolveExchange(accounts);
  return strategies.map((strategy) => ({
    id: strategy.strategy_id,
    name: strategy.display_name,
    status: normalizeStrategyStatus(strategy.status),
    exchange: normalizeExchange(strategy.exchange, fallbackExchange),
    instruments: [],
    pnlToday: status.profit,
    pnlTotal: status.profit,
    sharpeRatio: 0,
    maxDrawdown: 0,
    winRate: 0,
    trades: orders.length,
    lastSignal: "N/A",
    lastSignalTime: "—",
  }));
}

export async function fetchTradingOverview(): Promise<{
  positions: Position[];
  orders: Order[];
  strategies: Strategy[];
}> {
  const [positions, orders, strategies] = await Promise.all([
    fetchPositionsView(),
    fetchOrdersView(),
    fetchStrategiesView(),
  ]);
  return { positions, orders, strategies };
}

export async function fetchEquityCurve(range = "ALL"): Promise<EquityPoint[]> {
  return request<EquityPoint[]>(`/v1/performance/equity?range=${encodeURIComponent(range)}`);
}

export async function fetchDrawdown(): Promise<DrawdownPoint[]> {
  return request<DrawdownPoint[]>("/v1/performance/drawdown");
}

export async function fetchMonthlyReturns(): Promise<MonthlyReturn[]> {
  return request<MonthlyReturn[]>("/v1/performance/monthly-returns");
}

export async function fetchRollingSharpe(window = 90): Promise<RollingSharpePoint[]> {
  return request<RollingSharpePoint[]>(`/v1/performance/rolling-sharpe?window=${window}`);
}

export async function fetchReturnDistribution(): Promise<ReturnDistributionBucket[]> {
  return request<ReturnDistributionBucket[]>("/v1/performance/return-distribution");
}

export async function fetchPerformanceSummary(): Promise<PerformanceSummary> {
  return request<PerformanceSummary>("/v1/performance/summary");
}

export async function fetchRiskAllocation(): Promise<RiskAllocation> {
  return request<RiskAllocation>("/v1/risk/allocation");
}

export async function fetchRiskCorrelation(): Promise<CorrelationPair[]> {
  return request<CorrelationPair[]>("/v1/risk/correlation");
}

export async function fetchEfficientFrontier(): Promise<EfficientFrontierPoint[]> {
  return request<EfficientFrontierPoint[]>("/v1/risk/efficient-frontier");
}

export async function fetchBacktests(): Promise<BacktestConfig[]> {
  return request<BacktestConfig[]>("/v1/backtests");
}

export async function createBacktest(payload: BacktestCreatePayload): Promise<BacktestConfig> {
  return request<BacktestConfig>("/v1/backtests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchBacktestResult(id: string): Promise<BacktestResult> {
  return request<BacktestResult>(`/v1/backtests/${id}/result`);
}

export async function fetchDagsterJobs(): Promise<DagsterJob[]> {
  return request<DagsterJob[]>("/v1/dagster/jobs");
}

export async function fetchDagsterRuns(): Promise<DagsterRun[]> {
  return request<DagsterRun[]>("/v1/dagster/runs");
}

export async function fetchDataSources(startFrom?: string): Promise<DataSource[]> {
  const query = startFrom ? `?start_from=${encodeURIComponent(startFrom)}` : "";
  return request<DataSource[]>(`/v1/data/sources${query}`);
}

export async function fetchSystemHealthTopology(): Promise<SystemHealthSnapshot> {
  return request<SystemHealthSnapshot>("/v1/system/health-topology");
}

export async function fetchSystemLogs(limit = 40): Promise<SystemLogsSnapshot> {
  return request<SystemLogsSnapshot>(`/v1/system/logs?limit=${encodeURIComponent(String(limit))}`);
}

export async function fetchApiKeys(): Promise<ApiKeyRecord[]> {
  return request<ApiKeyRecord[]>("/v1/settings/api-keys");
}

export async function createApiKey(payload: ApiKeyPayload): Promise<ApiKeyRecord> {
  return request<ApiKeyRecord>("/v1/settings/api-keys", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateApiKey(
  id: string,
  payload: Partial<ApiKeyPayload> & { status?: ApiKeyRecord["status"] },
): Promise<ApiKeyRecord> {
  return request<ApiKeyRecord>(`/v1/settings/api-keys/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteApiKey(id: string): Promise<{ status: string; id: string }> {
  return request<{ status: string; id: string }>(`/v1/settings/api-keys/${id}`, {
    method: "DELETE",
  });
}

export async function fetchConnections(): Promise<ConnectionHealth[]> {
  return request<ConnectionHealth[]>("/v1/settings/connections");
}

export async function fetchSystemInfo(): Promise<SystemInfo[]> {
  return request<SystemInfo[]>("/v1/settings/system");
}

export async function fetchNotificationPreferences(): Promise<NotificationPreference[]> {
  return request<NotificationPreference[]>("/v1/settings/notifications");
}

export async function updateNotificationPreferences(
  payload: NotificationPreference[],
): Promise<NotificationPreference[]> {
  return request<NotificationPreference[]>("/v1/settings/notifications", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
