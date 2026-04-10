// Mock data for the trading platform

export type Exchange = 'binance' | 'hyperliquid';

export interface AccountSummary {
  exchange: Exchange;
  totalEquity: number;
  availableBalance: number;
  unrealizedPnl: number;
  dailyPnl: number;
  dailyPnlPercent: number;
  marginUsed: number;
  marginRatio: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  leverage: number;
  exchange: Exchange;
  strategy: string;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_LIMIT';
  price: number;
  quantity: number;
  filled: number;
  status: 'OPEN' | 'PARTIAL' | 'FILLED' | 'CANCELLED';
  exchange: Exchange;
  strategy: string;
  time: string;
}

export interface Strategy {
  id: string;
  name: string;
  status: 'RUNNING' | 'STOPPED' | 'ERROR';
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
}

export interface EquityPoint {
  date: string;
  equity: number;
  benchmark: number;
}

export interface RiskMetric {
  label: string;
  value: number | string;
  status: 'good' | 'warning' | 'danger';
}

// === New interfaces ===

export interface BacktestConfig {
  id: string;
  name: string;
  strategy: string;
  exchange: Exchange;
  instruments: string[];
  startDate: string;
  endDate: string;
  initialCapital: number;
  status: 'COMPLETED' | 'RUNNING' | 'FAILED' | 'QUEUED';
  createdAt: string;
}

export interface BacktestResult {
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
}

export interface BacktestTrade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  holdingPeriod: string;
}

export interface MonthlyReturn {
  year: number;
  month: number;
  return: number;
}

export interface DagsterJob {
  id: string;
  name: string;
  description: string;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED' | 'QUEUED' | 'CANCELLED';
  schedule: string;
  lastRun: string;
  duration: string;
  nextRun: string;
  tags: string[];
  upstream: string[];
  downstream: string[];
}

export interface DagsterRun {
  id: string;
  jobId: string;
  jobName: string;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED' | 'CANCELLED';
  startTime: string;
  endTime: string;
  duration: string;
  logs: DagsterLog[];
}

export interface DagsterLog {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  step?: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'exchange' | 'parquet' | 'duckdb' | 'api';
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'SYNCING';
  lastSync: string;
  recordCount: number;
  sizeBytes: number;
  instruments: string[];
  timeframes: string[];
  coverage: { from: string; to: string };
  quality: { completeness: number; gaps: number; latency: string };
}

export interface CorrelationPair {
  asset1: string;
  asset2: string;
  correlation: number;
}

export interface EfficientFrontierPoint {
  risk: number;
  return: number;
  label?: string;
  isCurrent?: boolean;
  isOptimal?: boolean;
}

// === Existing mock data ===

export const mockAccounts: Record<Exchange, AccountSummary> = {
  binance: {
    exchange: 'binance',
    totalEquity: 1_284_532.45,
    availableBalance: 842_210.32,
    unrealizedPnl: 23_456.78,
    dailyPnl: 12_345.67,
    dailyPnlPercent: 0.97,
    marginUsed: 442_322.13,
    marginRatio: 0.34,
  },
  hyperliquid: {
    exchange: 'hyperliquid',
    totalEquity: 567_891.23,
    availableBalance: 312_456.78,
    unrealizedPnl: -4_567.89,
    dailyPnl: -2_345.12,
    dailyPnlPercent: -0.41,
    marginUsed: 255_434.45,
    marginRatio: 0.45,
  },
};

export const mockPositions: Position[] = [
  { id: '1', symbol: 'BTC-USDT', side: 'LONG', size: 2.5, entryPrice: 67234.5, markPrice: 68912.3, unrealizedPnl: 4194.5, unrealizedPnlPercent: 2.49, leverage: 5, exchange: 'binance', strategy: 'Momentum Alpha' },
  { id: '2', symbol: 'ETH-USDT', side: 'LONG', size: 45.2, entryPrice: 3456.78, markPrice: 3523.45, unrealizedPnl: 3013.46, unrealizedPnlPercent: 1.93, leverage: 3, exchange: 'binance', strategy: 'Mean Reversion' },
  { id: '3', symbol: 'SOL-USDT', side: 'SHORT', size: 320, entryPrice: 178.45, markPrice: 175.23, unrealizedPnl: 1030.4, unrealizedPnlPercent: 1.80, leverage: 10, exchange: 'binance', strategy: 'Momentum Alpha' },
  { id: '4', symbol: 'BTC-USDT', side: 'LONG', size: 1.2, entryPrice: 68100.0, markPrice: 68912.3, unrealizedPnl: 974.76, unrealizedPnlPercent: 1.19, leverage: 5, exchange: 'hyperliquid', strategy: 'Cross-Exchange Arb' },
  { id: '5', symbol: 'ETH-USDT', side: 'SHORT', size: 25, entryPrice: 3510.0, markPrice: 3523.45, unrealizedPnl: -336.25, unrealizedPnlPercent: -0.38, leverage: 3, exchange: 'hyperliquid', strategy: 'Stat Arb' },
  { id: '6', symbol: 'ARB-USDT', side: 'LONG', size: 15000, entryPrice: 1.12, markPrice: 1.08, unrealizedPnl: -600, unrealizedPnlPercent: -3.57, leverage: 5, exchange: 'hyperliquid', strategy: 'Stat Arb' },
];

export const mockOrders: Order[] = [
  { id: 'o1', symbol: 'BTC-USDT', side: 'BUY', type: 'LIMIT', price: 66500, quantity: 0.5, filled: 0, status: 'OPEN', exchange: 'binance', strategy: 'Momentum Alpha', time: '2024-03-15 14:32:10' },
  { id: 'o2', symbol: 'ETH-USDT', side: 'SELL', type: 'STOP', price: 3400, quantity: 20, filled: 0, status: 'OPEN', exchange: 'binance', strategy: 'Mean Reversion', time: '2024-03-15 13:45:22' },
  { id: 'o3', symbol: 'SOL-USDT', side: 'BUY', type: 'LIMIT', price: 170, quantity: 100, filled: 45, status: 'PARTIAL', exchange: 'binance', strategy: 'Momentum Alpha', time: '2024-03-15 12:10:05' },
  { id: 'o4', symbol: 'BTC-USDT', side: 'SELL', type: 'LIMIT', price: 70000, quantity: 0.3, filled: 0, status: 'OPEN', exchange: 'hyperliquid', strategy: 'Cross-Exchange Arb', time: '2024-03-15 14:55:33' },
  { id: 'o5', symbol: 'DOGE-USDT', side: 'BUY', type: 'MARKET', price: 0.165, quantity: 50000, filled: 50000, status: 'FILLED', exchange: 'binance', strategy: 'Momentum Alpha', time: '2024-03-15 11:20:18' },
];

export const mockStrategies: Strategy[] = [
  { id: 's1', name: 'Momentum Alpha', status: 'RUNNING', exchange: 'binance', instruments: ['BTC-USDT', 'ETH-USDT', 'SOL-USDT'], pnlToday: 8234.56, pnlTotal: 145_678.90, sharpeRatio: 2.34, maxDrawdown: -8.5, winRate: 0.62, trades: 1243, lastSignal: 'BUY SOL-USDT', lastSignalTime: '2 min ago' },
  { id: 's2', name: 'Mean Reversion', status: 'RUNNING', exchange: 'binance', instruments: ['ETH-USDT', 'AVAX-USDT'], pnlToday: 2456.78, pnlTotal: 89_432.10, sharpeRatio: 1.87, maxDrawdown: -12.3, winRate: 0.58, trades: 876, lastSignal: 'SELL AVAX-USDT', lastSignalTime: '15 min ago' },
  { id: 's3', name: 'Cross-Exchange Arb', status: 'RUNNING', exchange: 'hyperliquid', instruments: ['BTC-USDT', 'ETH-USDT'], pnlToday: -1234.56, pnlTotal: 67_890.12, sharpeRatio: 3.12, maxDrawdown: -3.2, winRate: 0.78, trades: 2341, lastSignal: 'BUY BTC-USDT', lastSignalTime: '5 min ago' },
  { id: 's4', name: 'Stat Arb', status: 'ERROR', exchange: 'hyperliquid', instruments: ['ETH-USDT', 'ARB-USDT'], pnlToday: -3456.78, pnlTotal: 23_456.78, sharpeRatio: 1.45, maxDrawdown: -15.6, winRate: 0.52, trades: 543, lastSignal: 'ERROR: Feed timeout', lastSignalTime: '32 min ago' },
  { id: 's5', name: 'Funding Rate Harvester', status: 'STOPPED', exchange: 'binance', instruments: ['BTC-USDT'], pnlToday: 0, pnlTotal: 34_567.89, sharpeRatio: 1.92, maxDrawdown: -5.1, winRate: 0.71, trades: 412, lastSignal: 'STOPPED by user', lastSignalTime: '2h ago' },
];

export const generateEquityCurve = (): EquityPoint[] => {
  const points: EquityPoint[] = [];
  let equity = 1_000_000;
  let benchmark = 1_000_000;
  const startDate = new Date('2024-01-01');

  for (let i = 0; i < 75; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    equity *= 1 + (Math.random() * 0.04 - 0.015);
    benchmark *= 1 + (Math.random() * 0.03 - 0.014);
    points.push({
      date: date.toISOString().split('T')[0],
      equity: Math.round(equity * 100) / 100,
      benchmark: Math.round(benchmark * 100) / 100,
    });
  }
  return points;
};

export const mockRiskMetrics: RiskMetric[] = [
  { label: 'Portfolio VaR (95%)', value: '-$18,432', status: 'warning' },
  { label: 'Sharpe Ratio', value: 2.15, status: 'good' },
  { label: 'Sortino Ratio', value: 3.02, status: 'good' },
  { label: 'Max Drawdown', value: '-8.5%', status: 'warning' },
  { label: 'Beta (vs BTC)', value: 0.72, status: 'good' },
  { label: 'Correlation (BTC)', value: 0.65, status: 'good' },
  { label: 'Leverage Ratio', value: '3.2x', status: 'warning' },
  { label: 'Margin Usage', value: '34%', status: 'good' },
  { label: 'Daily VaR Breach', value: '0 days', status: 'good' },
  { label: 'Concentration Risk', value: 'BTC 45%', status: 'danger' },
];

export const drawdownData = [
  { date: '2024-01', drawdown: 0 },
  { date: '2024-01-15', drawdown: -2.3 },
  { date: '2024-02', drawdown: -1.1 },
  { date: '2024-02-15', drawdown: -5.4 },
  { date: '2024-03', drawdown: -8.5 },
  { date: '2024-03-10', drawdown: -3.2 },
  { date: '2024-03-15', drawdown: -1.8 },
];

// === New mock data ===

export const mockBacktestConfigs: BacktestConfig[] = [
  { id: 'bt1', name: 'Momentum Alpha v2.1', strategy: 'Momentum Alpha', exchange: 'binance', instruments: ['BTC-USDT', 'ETH-USDT', 'SOL-USDT'], startDate: '2023-01-01', endDate: '2024-03-15', initialCapital: 1_000_000, status: 'COMPLETED', createdAt: '2024-03-14 09:30:00' },
  { id: 'bt2', name: 'Mean Rev - ETH focus', strategy: 'Mean Reversion', exchange: 'binance', instruments: ['ETH-USDT', 'AVAX-USDT'], startDate: '2023-06-01', endDate: '2024-03-15', initialCapital: 500_000, status: 'COMPLETED', createdAt: '2024-03-13 14:20:00' },
  { id: 'bt3', name: 'Arb Spread Test', strategy: 'Cross-Exchange Arb', exchange: 'hyperliquid', instruments: ['BTC-USDT'], startDate: '2024-01-01', endDate: '2024-03-15', initialCapital: 250_000, status: 'RUNNING', createdAt: '2024-03-15 11:00:00' },
  { id: 'bt4', name: 'Stat Arb Revised', strategy: 'Stat Arb', exchange: 'hyperliquid', instruments: ['ETH-USDT', 'ARB-USDT'], startDate: '2023-09-01', endDate: '2024-02-28', initialCapital: 300_000, status: 'FAILED', createdAt: '2024-03-12 16:45:00' },
  { id: 'bt5', name: 'Funding Rate v3', strategy: 'Funding Rate Harvester', exchange: 'binance', instruments: ['BTC-USDT'], startDate: '2023-01-01', endDate: '2024-03-01', initialCapital: 1_000_000, status: 'QUEUED', createdAt: '2024-03-15 12:30:00' },
];

const generateBacktestEquity = (startCapital: number, days: number): EquityPoint[] => {
  const points: EquityPoint[] = [];
  let equity = startCapital;
  let benchmark = startCapital;
  const startDate = new Date('2023-01-01');
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    equity *= 1 + (Math.random() * 0.035 - 0.012);
    benchmark *= 1 + (Math.random() * 0.025 - 0.012);
    points.push({
      date: date.toISOString().split('T')[0],
      equity: Math.round(equity * 100) / 100,
      benchmark: Math.round(benchmark * 100) / 100,
    });
  }
  return points;
};

export const mockBacktestResults: Record<string, BacktestResult> = {
  bt1: {
    configId: 'bt1',
    totalReturn: 85.2,
    annualizedReturn: 142.3,
    sharpeRatio: 2.34,
    sortinoRatio: 3.45,
    maxDrawdown: -8.5,
    winRate: 62,
    totalTrades: 1243,
    profitFactor: 2.4,
    avgTrade: 234,
    calmarRatio: 16.7,
    volatility: 18.3,
    equityCurve: generateBacktestEquity(1_000_000, 440),
    trades: [
      { id: 't1', symbol: 'BTC-USDT', side: 'BUY', entryTime: '2023-01-15 09:30', exitTime: '2023-01-18 14:20', entryPrice: 21340, exitPrice: 22890, quantity: 2.5, pnl: 3875, pnlPercent: 7.26, holdingPeriod: '3d 4h' },
      { id: 't2', symbol: 'ETH-USDT', side: 'BUY', entryTime: '2023-02-03 11:15', exitTime: '2023-02-05 08:45', entryPrice: 1620, exitPrice: 1695, quantity: 50, pnl: 3750, pnlPercent: 4.63, holdingPeriod: '1d 21h' },
      { id: 't3', symbol: 'SOL-USDT', side: 'SELL', entryTime: '2023-02-15 16:00', exitTime: '2023-02-16 10:30', entryPrice: 24.5, exitPrice: 23.1, quantity: 500, pnl: 700, pnlPercent: 5.71, holdingPeriod: '18h' },
      { id: 't4', symbol: 'BTC-USDT', side: 'BUY', entryTime: '2023-03-10 08:00', exitTime: '2023-03-12 15:45', entryPrice: 24200, exitPrice: 23800, quantity: 1.5, pnl: -600, pnlPercent: -1.65, holdingPeriod: '2d 7h' },
      { id: 't5', symbol: 'ETH-USDT', side: 'SELL', entryTime: '2023-04-01 13:20', exitTime: '2023-04-03 09:10', entryPrice: 1850, exitPrice: 1790, quantity: 30, pnl: 1800, pnlPercent: 3.24, holdingPeriod: '1d 19h' },
      { id: 't6', symbol: 'SOL-USDT', side: 'BUY', entryTime: '2023-05-12 10:00', exitTime: '2023-05-15 16:30', entryPrice: 20.8, exitPrice: 22.1, quantity: 800, pnl: 1040, pnlPercent: 6.25, holdingPeriod: '3d 6h' },
    ],
    monthlyReturns: [
      { year: 2023, month: 1, return: 8.2 }, { year: 2023, month: 2, return: 5.4 }, { year: 2023, month: 3, return: -2.1 },
      { year: 2023, month: 4, return: 12.3 }, { year: 2023, month: 5, return: 3.7 }, { year: 2023, month: 6, return: -4.5 },
      { year: 2023, month: 7, return: 9.1 }, { year: 2023, month: 8, return: 6.8 }, { year: 2023, month: 9, return: -1.3 },
      { year: 2023, month: 10, return: 15.2 }, { year: 2023, month: 11, return: 7.6 }, { year: 2023, month: 12, return: 11.4 },
      { year: 2024, month: 1, return: 4.9 }, { year: 2024, month: 2, return: 8.3 }, { year: 2024, month: 3, return: 2.1 },
    ],
  },
  bt2: {
    configId: 'bt2',
    totalReturn: 45.8,
    annualizedReturn: 62.1,
    sharpeRatio: 1.87,
    sortinoRatio: 2.65,
    maxDrawdown: -12.3,
    winRate: 58,
    totalTrades: 876,
    profitFactor: 1.8,
    avgTrade: 156,
    calmarRatio: 5.0,
    volatility: 22.5,
    equityCurve: generateBacktestEquity(500_000, 290),
    trades: [
      { id: 't1', symbol: 'ETH-USDT', side: 'BUY', entryTime: '2023-06-05 10:00', exitTime: '2023-06-07 14:30', entryPrice: 1870, exitPrice: 1920, quantity: 40, pnl: 2000, pnlPercent: 2.67, holdingPeriod: '2d 4h' },
      { id: 't2', symbol: 'AVAX-USDT', side: 'SELL', entryTime: '2023-06-12 09:15', exitTime: '2023-06-13 11:00', entryPrice: 14.2, exitPrice: 13.8, quantity: 1000, pnl: 400, pnlPercent: 2.82, holdingPeriod: '1d 1h' },
    ],
    monthlyReturns: [
      { year: 2023, month: 6, return: 3.2 }, { year: 2023, month: 7, return: 7.5 }, { year: 2023, month: 8, return: -3.8 },
      { year: 2023, month: 9, return: 5.1 }, { year: 2023, month: 10, return: 10.2 }, { year: 2023, month: 11, return: 4.3 },
      { year: 2023, month: 12, return: 8.9 }, { year: 2024, month: 1, return: 2.7 }, { year: 2024, month: 2, return: 6.1 },
      { year: 2024, month: 3, return: 1.5 },
    ],
  },
};

export const mockDagsterJobs: DagsterJob[] = [
  { id: 'j1', name: 'sync_binance_klines', description: 'Sync Binance OHLCV kline data to Parquet files via CCXT', status: 'SUCCESS', schedule: '*/5 * * * *', lastRun: '2024-03-15 14:30:00', duration: '45s', nextRun: '2024-03-15 14:35:00', tags: ['data', 'binance', 'ccxt'], upstream: [], downstream: ['compute_features', 'update_duckdb'] },
  { id: 'j2', name: 'sync_hyperliquid_trades', description: 'Sync Hyperliquid trade data and funding rates', status: 'SUCCESS', schedule: '*/5 * * * *', lastRun: '2024-03-15 14:30:00', duration: '32s', nextRun: '2024-03-15 14:35:00', tags: ['data', 'hyperliquid'], upstream: [], downstream: ['compute_features'] },
  { id: 'j3', name: 'compute_features', description: 'Compute technical indicators and features using Polars', status: 'RUNNING', schedule: '*/10 * * * *', lastRun: '2024-03-15 14:30:00', duration: '—', nextRun: '2024-03-15 14:40:00', tags: ['features', 'polars'], upstream: ['sync_binance_klines', 'sync_hyperliquid_trades'], downstream: ['run_signals'] },
  { id: 'j4', name: 'update_duckdb', description: 'Aggregate Parquet files into DuckDB analytics tables', status: 'SUCCESS', schedule: '0 * * * *', lastRun: '2024-03-15 14:00:00', duration: '2m 15s', nextRun: '2024-03-15 15:00:00', tags: ['data', 'duckdb'], upstream: ['sync_binance_klines'], downstream: ['generate_report'] },
  { id: 'j5', name: 'run_signals', description: 'Execute NautilusTrader signal generation for all active strategies', status: 'QUEUED', schedule: '*/10 * * * *', lastRun: '2024-03-15 14:20:00', duration: '1m 30s', nextRun: '2024-03-15 14:40:00', tags: ['trading', 'nautilus'], upstream: ['compute_features'], downstream: ['execute_orders'] },
  { id: 'j6', name: 'execute_orders', description: 'Route orders to exchanges via CCXT/ib_async', status: 'SUCCESS', schedule: 'triggered', lastRun: '2024-03-15 14:22:00', duration: '8s', nextRun: '—', tags: ['trading', 'execution'], upstream: ['run_signals'], downstream: [] },
  { id: 'j7', name: 'risk_check', description: 'Run portfolio risk analysis using skfolio', status: 'SUCCESS', schedule: '*/15 * * * *', lastRun: '2024-03-15 14:15:00', duration: '55s', nextRun: '2024-03-15 14:30:00', tags: ['risk', 'skfolio'], upstream: ['compute_features'], downstream: ['generate_report'] },
  { id: 'j8', name: 'generate_report', description: 'Generate QuantStats performance reports', status: 'FAILED', schedule: '0 0 * * *', lastRun: '2024-03-15 00:00:00', duration: '3m 12s', nextRun: '2024-03-16 00:00:00', tags: ['reporting', 'quantstats'], upstream: ['update_duckdb', 'risk_check'], downstream: [] },
  { id: 'j9', name: 'portfolio_optimize', description: 'Run portfolio optimization with skfolio efficient frontier', status: 'SUCCESS', schedule: '0 6 * * *', lastRun: '2024-03-15 06:00:00', duration: '5m 42s', nextRun: '2024-03-16 06:00:00', tags: ['optimization', 'skfolio'], upstream: ['compute_features'], downstream: [] },
];

export const mockDagsterRuns: DagsterRun[] = [
  { id: 'r1', jobId: 'j8', jobName: 'generate_report', status: 'FAILED', startTime: '2024-03-15 00:00:00', endTime: '2024-03-15 00:03:12', duration: '3m 12s', logs: [
    { timestamp: '00:00:00', level: 'INFO', message: 'Starting QuantStats report generation', step: 'init' },
    { timestamp: '00:00:05', level: 'INFO', message: 'Fetching equity curve from DuckDB', step: 'fetch_data' },
    { timestamp: '00:00:32', level: 'INFO', message: 'Loaded 1,852,423 records from analytics tables', step: 'fetch_data' },
    { timestamp: '00:01:15', level: 'WARNING', message: 'Missing data points detected for ARB-USDT (2024-03-14 22:00 - 23:00)', step: 'validate' },
    { timestamp: '00:02:45', level: 'ERROR', message: 'QuantStats report generation failed: ValueError - insufficient data for rolling 252-day Sharpe calculation', step: 'generate' },
    { timestamp: '00:03:12', level: 'ERROR', message: 'Job failed with exit code 1', step: 'cleanup' },
  ]},
  { id: 'r2', jobId: 'j1', jobName: 'sync_binance_klines', status: 'SUCCESS', startTime: '2024-03-15 14:30:00', endTime: '2024-03-15 14:30:45', duration: '45s', logs: [
    { timestamp: '14:30:00', level: 'INFO', message: 'Starting Binance kline sync via CCXT', step: 'init' },
    { timestamp: '14:30:02', level: 'INFO', message: 'Fetching BTC-USDT, ETH-USDT, SOL-USDT (1m, 5m, 1h)', step: 'fetch' },
    { timestamp: '14:30:38', level: 'INFO', message: 'Written 12,450 new rows to Parquet', step: 'write' },
    { timestamp: '14:30:45', level: 'INFO', message: 'Sync completed successfully', step: 'complete' },
  ]},
  { id: 'r3', jobId: 'j3', jobName: 'compute_features', status: 'RUNNING', startTime: '2024-03-15 14:30:00', endTime: '', duration: '—', logs: [
    { timestamp: '14:30:00', level: 'INFO', message: 'Starting feature computation with Polars', step: 'init' },
    { timestamp: '14:30:05', level: 'INFO', message: 'Loading latest kline data from Parquet store', step: 'load' },
    { timestamp: '14:30:18', level: 'INFO', message: 'Computing RSI, MACD, Bollinger Bands for 15 instruments', step: 'compute' },
    { timestamp: '14:30:45', level: 'DEBUG', message: 'Processing BTC-USDT features (EMA_20, EMA_50, VWAP)', step: 'compute' },
  ]},
];

export const mockDataSources: DataSource[] = [
  { id: 'd1', name: 'Binance Spot/Futures', type: 'exchange', status: 'CONNECTED', lastSync: '2024-03-15 14:30:45', recordCount: 45_678_234, sizeBytes: 12_340_000_000, instruments: ['BTC-USDT', 'ETH-USDT', 'SOL-USDT', 'AVAX-USDT', 'DOGE-USDT', 'ARB-USDT'], timeframes: ['1m', '5m', '15m', '1h', '4h', '1d'], coverage: { from: '2022-01-01', to: '2024-03-15' }, quality: { completeness: 99.7, gaps: 3, latency: '< 500ms' } },
  { id: 'd2', name: 'Hyperliquid Perpetuals', type: 'exchange', status: 'CONNECTED', lastSync: '2024-03-15 14:30:32', recordCount: 18_234_567, sizeBytes: 4_560_000_000, instruments: ['BTC-USDT', 'ETH-USDT', 'ARB-USDT'], timeframes: ['1m', '5m', '1h', '4h'], coverage: { from: '2023-06-01', to: '2024-03-15' }, quality: { completeness: 98.9, gaps: 12, latency: '< 200ms' } },
  { id: 'd3', name: 'Parquet Feature Store', type: 'parquet', status: 'CONNECTED', lastSync: '2024-03-15 14:31:00', recordCount: 89_456_123, sizeBytes: 28_900_000_000, instruments: ['BTC-USDT', 'ETH-USDT', 'SOL-USDT', 'AVAX-USDT', 'DOGE-USDT', 'ARB-USDT'], timeframes: ['1m', '5m', '15m', '1h', '4h', '1d'], coverage: { from: '2022-01-01', to: '2024-03-15' }, quality: { completeness: 99.5, gaps: 5, latency: '< 100ms' } },
  { id: 'd4', name: 'DuckDB Analytics', type: 'duckdb', status: 'CONNECTED', lastSync: '2024-03-15 14:00:00', recordCount: 12_345_678, sizeBytes: 3_210_000_000, instruments: ['BTC-USDT', 'ETH-USDT', 'SOL-USDT', 'AVAX-USDT'], timeframes: ['1h', '4h', '1d'], coverage: { from: '2022-01-01', to: '2024-03-15' }, quality: { completeness: 100, gaps: 0, latency: '< 50ms' } },
  { id: 'd5', name: 'Alternative Data API', type: 'api', status: 'ERROR', lastSync: '2024-03-15 12:00:00', recordCount: 1_234_567, sizeBytes: 450_000_000, instruments: ['BTC', 'ETH'], timeframes: ['1h', '1d'], coverage: { from: '2023-01-01', to: '2024-03-14' }, quality: { completeness: 95.2, gaps: 28, latency: '> 2s' } },
];

export const mockCorrelations: CorrelationPair[] = [
  { asset1: 'BTC', asset2: 'ETH', correlation: 0.85 },
  { asset1: 'BTC', asset2: 'SOL', correlation: 0.72 },
  { asset1: 'BTC', asset2: 'AVAX', correlation: 0.68 },
  { asset1: 'BTC', asset2: 'ARB', correlation: 0.55 },
  { asset1: 'BTC', asset2: 'DOGE', correlation: 0.48 },
  { asset1: 'ETH', asset2: 'SOL', correlation: 0.78 },
  { asset1: 'ETH', asset2: 'AVAX', correlation: 0.82 },
  { asset1: 'ETH', asset2: 'ARB', correlation: 0.71 },
  { asset1: 'ETH', asset2: 'DOGE', correlation: 0.42 },
  { asset1: 'SOL', asset2: 'AVAX', correlation: 0.74 },
  { asset1: 'SOL', asset2: 'ARB', correlation: 0.62 },
  { asset1: 'SOL', asset2: 'DOGE', correlation: 0.51 },
  { asset1: 'AVAX', asset2: 'ARB', correlation: 0.65 },
  { asset1: 'AVAX', asset2: 'DOGE', correlation: 0.38 },
  { asset1: 'ARB', asset2: 'DOGE', correlation: 0.35 },
];

export const mockEfficientFrontier: EfficientFrontierPoint[] = [
  { risk: 12, return: 25, label: 'Min Variance' },
  { risk: 15, return: 42 },
  { risk: 18, return: 58 },
  { risk: 20, return: 68, label: 'Max Sharpe', isOptimal: true },
  { risk: 22, return: 72 },
  { risk: 25, return: 78 },
  { risk: 28, return: 82 },
  { risk: 32, return: 85, label: 'Max Return' },
  { risk: 24, return: 62, label: 'Current Portfolio', isCurrent: true },
];

// Monthly returns for heatmap (QuantStats style)
export const mockMonthlyReturns: MonthlyReturn[] = [
  { year: 2023, month: 1, return: 8.2 }, { year: 2023, month: 2, return: 5.4 }, { year: 2023, month: 3, return: -2.1 },
  { year: 2023, month: 4, return: 12.3 }, { year: 2023, month: 5, return: 3.7 }, { year: 2023, month: 6, return: -4.5 },
  { year: 2023, month: 7, return: 9.1 }, { year: 2023, month: 8, return: 6.8 }, { year: 2023, month: 9, return: -1.3 },
  { year: 2023, month: 10, return: 15.2 }, { year: 2023, month: 11, return: 7.6 }, { year: 2023, month: 12, return: 11.4 },
  { year: 2024, month: 1, return: 4.9 }, { year: 2024, month: 2, return: 8.3 }, { year: 2024, month: 3, return: 2.1 },
];

// Rolling Sharpe data
export const generateRollingSharpe = () => {
  const points: { date: string; sharpe: number }[] = [];
  const startDate = new Date('2023-01-01');
  let sharpe = 1.5;
  for (let i = 0; i < 440; i += 5) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    sharpe += (Math.random() - 0.45) * 0.3;
    sharpe = Math.max(-0.5, Math.min(4, sharpe));
    points.push({ date: date.toISOString().split('T')[0], sharpe: Math.round(sharpe * 100) / 100 });
  }
  return points;
};

// Return distribution data
export const generateReturnDistribution = () => {
  const bins: { range: string; count: number; midpoint: number }[] = [];
  const ranges = [
    { range: '< -5%', midpoint: -7, count: 3 },
    { range: '-5 to -3%', midpoint: -4, count: 8 },
    { range: '-3 to -1%', midpoint: -2, count: 18 },
    { range: '-1 to 0%', midpoint: -0.5, count: 35 },
    { range: '0 to 1%', midpoint: 0.5, count: 42 },
    { range: '1 to 3%', midpoint: 2, count: 28 },
    { range: '3 to 5%', midpoint: 4, count: 15 },
    { range: '> 5%', midpoint: 7, count: 6 },
  ];
  return ranges;
};
