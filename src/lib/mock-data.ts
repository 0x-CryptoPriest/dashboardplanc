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

// Generate equity curve data
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
