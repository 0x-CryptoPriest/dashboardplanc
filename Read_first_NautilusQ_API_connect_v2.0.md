# NautilusQ API 接口对接文档 v2.0

> 更新日期: 2026-04-10  
> 前端技术栈: React 18 + TanStack Query + Recharts + Tailwind CSS  
> 后端建议栈: FastAPI / NautilusTrader + Dagster + DuckDB + Polars

---

## 目录

1. [通用约定](#1-通用约定)
2. [账户模块](#2-账户模块)
3. [持仓模块](#3-持仓模块)
4. [订单模块](#4-订单模块)
5. [策略模块](#5-策略模块)
6. [绩效模块](#6-绩效模块)
7. [风险模块](#7-风险模块)
8. [回测模块](#8-回测模块)
9. [Dagster 任务模块](#9-dagster-任务模块)
10. [数据管理模块](#10-数据管理模块)
11. [设置模块](#11-设置模块)
12. [WebSocket 实时频道](#12-websocket-实时频道)
13. [前端数据结构参考](#13-前端数据结构参考)
14. [对接注意事项](#14-对接注意事项)

---

## 1. 通用约定

### 基础信息

| 项目 | 值 |
|------|-----|
| Base URL | `https://api.nautilusq.io/v1` |
| 协议 | HTTPS + WSS |
| 认证方式 | Bearer Token (JWT) |
| 内容类型 | `application/json` |
| 时间格式 | ISO 8601 (`2024-03-15T14:30:00Z`) |
| 分页 | `?page=1&limit=50` |
| 排序 | `?sort=createdAt&order=desc` |

### 通用响应格式

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 234,
    "timestamp": "2024-03-15T14:30:00Z"
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_MARGIN",
    "message": "Margin ratio exceeded threshold",
    "details": {}
  }
}
```

### Exchange 枚举

前端 `Exchange` 类型定义为:

```typescript
type Exchange = 'binance' | 'hyperliquid';
```

所有接口中 `exchange` 字段应使用以上值之一。全局筛选器支持 `'all'` 表示不过滤。

---

## 2. 账户模块

### GET /accounts

获取所有交易所账户摘要。

**响应体:**

```typescript
interface AccountSummary {
  exchange: 'binance' | 'hyperliquid';
  totalEquity: number;        // 总权益 (USD)
  availableBalance: number;   // 可用余额
  unrealizedPnl: number;      // 未实现盈亏
  dailyPnl: number;           // 当日盈亏
  dailyPnlPercent: number;    // 当日盈亏百分比 (如 0.97 表示 +0.97%)
  marginUsed: number;         // 已用保证金
  marginRatio: number;        // 保证金比率 (0-1, 如 0.34 表示 34%)
}
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "binance": {
      "exchange": "binance",
      "totalEquity": 1284532.45,
      "availableBalance": 842210.32,
      "unrealizedPnl": 23456.78,
      "dailyPnl": 12345.67,
      "dailyPnlPercent": 0.97,
      "marginUsed": 442322.13,
      "marginRatio": 0.34
    },
    "hyperliquid": { ... }
  }
}
```

### GET /accounts/:exchange

获取单个交易所账户摘要。

---

## 3. 持仓模块

### GET /positions

**查询参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| exchange | string | 可选，`binance` / `hyperliquid` |
| strategy | string | 可选，按策略名筛选 |

**响应体:**

```typescript
interface Position {
  id: string;
  symbol: string;              // 如 "BTC-USDT"
  side: 'LONG' | 'SHORT';
  size: number;                // 持仓数量
  entryPrice: number;          // 开仓均价
  markPrice: number;           // 当前标记价格
  unrealizedPnl: number;       // 未实现盈亏 (USD)
  unrealizedPnlPercent: number; // 未实现盈亏百分比
  leverage: number;            // 杠杆倍数
  exchange: Exchange;
  strategy: string;            // 关联策略名
}
```

### GET /positions/:id

获取单个持仓详情。

---

## 4. 订单模块

### GET /orders

**查询参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| exchange | string | 可选 |
| status | string | 可选，`OPEN` / `PARTIAL` / `FILLED` / `CANCELLED` |
| strategy | string | 可选 |
| from | string | 可选，起始时间 |
| to | string | 可选，结束时间 |

**响应体:**

```typescript
interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_LIMIT';
  price: number;
  quantity: number;
  filled: number;              // 已成交数量
  status: 'OPEN' | 'PARTIAL' | 'FILLED' | 'CANCELLED';
  exchange: Exchange;
  strategy: string;
  time: string;                // ISO 8601 格式
}
```

### POST /orders

创建新订单 (保留接口, 前端暂未实现)。

### DELETE /orders/:id

取消订单。

---

## 5. 策略模块

### GET /strategies

**查询参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| exchange | string | 可选 |
| status | string | 可选，`RUNNING` / `STOPPED` / `ERROR` |

**响应体:**

```typescript
interface Strategy {
  id: string;
  name: string;
  status: 'RUNNING' | 'STOPPED' | 'ERROR';
  exchange: Exchange;
  instruments: string[];       // 交易标的列表
  pnlToday: number;           // 当日盈亏
  pnlTotal: number;           // 累计盈亏
  sharpeRatio: number;
  maxDrawdown: number;         // 负数百分比, 如 -8.5
  winRate: number;             // 0-1 之间, 如 0.62
  trades: number;              // 总交易次数
  lastSignal: string;          // 最近信号描述
  lastSignalTime: string;      // 相对时间描述, 如 "2 min ago"
}
```

### POST /strategies/:id/start

启动策略。

### POST /strategies/:id/stop

停止策略。

---

## 6. 绩效模块

### GET /performance/equity

获取权益曲线数据。

**查询参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| range | string | `1D` / `1W` / `1M` / `3M` / `6M` / `1Y` / `ALL` |
| exchange | string | 可选 |

**响应体:**

```typescript
interface EquityPoint {
  date: string;        // "2024-01-15"
  equity: number;      // 组合权益值
  benchmark: number;   // 基准值
}
```

**注意:** 前端 `TimeRangeSelector` 组件支持 `1D/1W/1M/3M/6M/1Y/ALL` 七档切换，后端需支持对应时间范围筛选。

### GET /performance/drawdown

获取回撤数据。

```typescript
interface DrawdownPoint {
  date: string;
  drawdown: number;    // 负数百分比, 如 -8.5
}
```

### GET /performance/monthly-returns

获取月度收益热力图数据。

```typescript
interface MonthlyReturn {
  year: number;        // 如 2023
  month: number;       // 1-12
  return: number;      // 百分比, 如 8.2 表示 +8.2%
}
```

### GET /performance/rolling-sharpe

获取滚动 Sharpe 比率。

**查询参数:**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| window | number | 90 | 滚动窗口天数 |

```typescript
interface RollingSharpePoint {
  date: string;
  sharpe: number;
}
```

### GET /performance/return-distribution

获取日收益分布直方图数据。

```typescript
interface ReturnBin {
  range: string;       // 如 "-3 to -1%"
  count: number;       // 频率
  midpoint: number;    // 区间中点, 用于着色 (正/负)
}
```

### GET /performance/summary

获取绩效汇总指标。

```typescript
interface PerformanceSummary {
  totalReturn: string;       // "+85.2%"
  annualizedReturn: string;  // "+142.3%"
  sharpeRatio: string;       // "2.15"
  sortinoRatio: string;      // "3.02"
  maxDrawdown: string;       // "-8.5%"
  winRate: string;           // "62%"
  profitFactor: string;      // "2.4"
  avgTrade: string;          // "+$234"
}
```

---

## 7. 风险模块

### GET /risk/metrics

获取风险指标面板数据。

```typescript
interface RiskMetric {
  label: string;
  value: number | string;
  status: 'good' | 'warning' | 'danger';
}
```

### GET /risk/allocation

获取资产配置数据。

```typescript
interface AllocationItem {
  name: string;       // 资产名 "BTC"
  value: number;      // 配置百分比
}
```

### GET /risk/correlation

获取资产相关性矩阵。

```typescript
interface CorrelationPair {
  asset1: string;
  asset2: string;
  correlation: number;  // -1 到 1
}
```

**前端使用:** 构建 N×N 矩阵，对角线为 1，未匹配对默认为 0。

### GET /risk/efficient-frontier

获取有效前沿数据 (skfolio)。

```typescript
interface EfficientFrontierPoint {
  risk: number;         // 波动率百分比
  return: number;       // 收益百分比
  label?: string;       // 可选标注, 如 "Max Sharpe"
  isCurrent?: boolean;  // 当前组合标记
  isOptimal?: boolean;  // 最优组合标记
}
```

### GET /risk/optimization

获取组合优化建议。

```typescript
interface OptimizationSuggestion {
  name: string;
  current: number;     // 当前配置 %
  optimal: number;     // 建议配置 %
}
```

---

## 8. 回测模块

### GET /backtests

获取回测配置列表。

**查询参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| exchange | string | 可选 |
| status | string | 可选，`COMPLETED` / `RUNNING` / `FAILED` / `QUEUED` |

```typescript
interface BacktestConfig {
  id: string;
  name: string;
  strategy: string;
  exchange: Exchange;
  instruments: string[];
  startDate: string;           // "2023-01-01"
  endDate: string;
  initialCapital: number;
  status: 'COMPLETED' | 'RUNNING' | 'FAILED' | 'QUEUED';
  createdAt: string;           // ISO 8601
}
```

### GET /backtests/:id/result

获取回测结果。仅 `COMPLETED` 状态的回测有结果。

```typescript
interface BacktestResult {
  configId: string;
  totalReturn: number;          // 百分比, 如 85.2
  annualizedReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;          // 负数, 如 -8.5
  winRate: number;              // 整数百分比, 如 62
  totalTrades: number;
  profitFactor: number;
  avgTrade: number;             // 平均每笔盈亏 (USD)
  calmarRatio: number;
  volatility: number;           // 百分比
  equityCurve: EquityPoint[];   // 同绩效模块
  trades: BacktestTrade[];
  monthlyReturns: MonthlyReturn[];
}

interface BacktestTrade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  entryTime: string;            // "2023-01-15 09:30"
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;                  // USD
  pnlPercent: number;
  holdingPeriod: string;        // "3d 4h"
}
```

### POST /backtests

创建新回测任务。

### DELETE /backtests/:id

删除回测。

---

## 9. Dagster 任务模块

### GET /dagster/jobs

获取所有 Dagster Job 定义。

```typescript
interface DagsterJob {
  id: string;
  name: string;
  description: string;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED' | 'QUEUED' | 'CANCELLED';
  schedule: string;            // cron 表达式或 "triggered"
  lastRun: string;             // ISO 8601
  duration: string;            // 如 "45s", "2m 15s", "—"
  nextRun: string;             // ISO 8601 或 "—"
  tags: string[];              // 如 ["data", "binance", "ccxt"]
  upstream: string[];          // 上游 Job 名称列表
  downstream: string[];        // 下游 Job 名称列表
}
```

**前端使用:** `upstream`/`downstream` 用于 DAG 可视化拓扑排序。

### GET /dagster/runs

获取最近运行记录。

**查询参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| jobId | string | 可选，按 Job 筛选 |
| limit | number | 默认 20 |

```typescript
interface DagsterRun {
  id: string;
  jobId: string;
  jobName: string;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED' | 'CANCELLED';
  startTime: string;
  endTime: string;             // 空字符串表示仍在运行
  duration: string;
  logs: DagsterLog[];
}

interface DagsterLog {
  timestamp: string;           // 如 "14:30:00"
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  step?: string;               // 可选步骤名
}
```

### POST /dagster/jobs/:id/trigger

手动触发 Job。

---

## 10. 数据管理模块

### GET /data/sources

获取数据源列表。

```typescript
interface DataSource {
  id: string;
  name: string;
  type: 'exchange' | 'parquet' | 'duckdb' | 'api';
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'SYNCING';
  lastSync: string;            // ISO 8601
  recordCount: number;
  sizeBytes: number;           // 字节数，前端自动格式化
  instruments: string[];
  timeframes: string[];        // 如 ["1m", "5m", "1h", "4h", "1d"]
  coverage: {
    from: string;              // "2022-01-01"
    to: string;                // "2024-03-15"
  };
  quality: {
    completeness: number;      // 0-100 百分比
    gaps: number;              // 数据缺口数量
    latency: string;           // 如 "< 500ms"
  };
}
```

### POST /data/sources/:id/sync

触发数据源同步。

---

## 11. 设置模块

### GET /settings/api-keys

获取 API Key 列表 (密钥脱敏)。

```typescript
interface APIKey {
  id: string;
  name: string;
  exchange: string;
  status: 'active' | 'expired' | 'error';
  maskedKey: string;           // 如 "aK7x...mR9pQ2w"
  lastUsed: string;            // 相对时间
}
```

### GET /settings/connections

获取连接健康状态。

```typescript
interface ConnectionHealth {
  name: string;
  endpoint: string;
  latency: string;             // 如 "12ms" 或 "—"
  status: 'healthy' | 'degraded' | 'down';
}
```

### GET /settings/system

获取系统配置信息。

```typescript
interface SystemInfo {
  label: string;               // 如 "Engine"
  value: string;               // 如 "NautilusTrader v1.182"
}
```

### PUT /settings/notifications

更新通知偏好。

```typescript
interface NotificationPreference {
  key: string;                 // 如 "strategy_error_alerts"
  enabled: boolean;
}
```

---

## 12. WebSocket 实时频道

### 连接

```
wss://api.nautilusq.io/v1/ws?token=<JWT>
```

### 频道订阅

```json
{ "action": "subscribe", "channel": "account:binance" }
```

### 频道列表

| 频道 | 推送内容 | 频率 |
|------|---------|------|
| `account:{exchange}` | AccountSummary 更新 | 1s |
| `positions` | Position[] 全量快照 | 1s |
| `orders` | Order 增量事件 (NEW/FILLED/CANCELLED) | 实时 |
| `strategy:{id}` | Strategy 状态+信号更新 | 实时 |
| `equity` | EquityPoint 追加 | 5s |
| `notifications` | 系统通知推送 | 实时 |
| `dagster:status` | Job 状态变更 | 实时 |

### 通知消息格式

```typescript
interface Notification {
  id: string;
  type: 'strategy_error' | 'margin_warning' | 'order_fill' | 'connection_lost' | 'drawdown_alert' | 'job_failure';
  title: string;
  message: string;
  timestamp: string;           // ISO 8601
  severity: 'info' | 'warning' | 'error';
  read: boolean;
}
```

---

## 13. 前端数据结构参考

所有 TypeScript 接口定义在 `src/lib/mock-data.ts`，包含:

| 接口 | 用途 |
|------|------|
| `AccountSummary` | Dashboard 顶部指标卡片 |
| `Position` | 持仓表格 |
| `Order` | 订单表格 |
| `Strategy` | 策略卡片 |
| `EquityPoint` | 权益曲线图表 (EquityChart + Backtest) |
| `MonthlyReturn` | 月度收益热力图 (MonthlyHeatmap 共享组件) |
| `RiskMetric` | 风险指标面板 |
| `CorrelationPair` | 相关性矩阵 |
| `EfficientFrontierPoint` | 有效前沿散点图 |
| `BacktestConfig` | 回测配置列表 |
| `BacktestResult` | 回测结果详情 |
| `BacktestTrade` | 回测交易日志 |
| `DagsterJob` | Dagster 任务定义 |
| `DagsterRun` | Dagster 运行记录 |
| `DagsterLog` | 运行日志条目 |
| `DataSource` | 数据源配置 |

---

## 14. 对接注意事项

### ⚠️ 关键对接要点

1. **Exchange 筛选器**: 前端全局头部有 Exchange 选择器 (`all` / `binance` / `hyperliquid`)，所有列表接口需支持 `?exchange=` 查询参数。

2. **时间范围选择器**: 绩效页面的 EquityChart 使用 `TimeRangeSelector` 组件 (`1D/1W/1M/3M/6M/1Y/ALL`)，后端 `/performance/equity` 需支持 `?range=` 参数。

3. **实时时钟**: 前端头部显示实时时钟 (每秒更新)，与后端无关，仅用于 UI 展示。

4. **Cmd+K 全局搜索**: `CommandPalette` 组件在前端搜索策略、持仓、订单、页面名称，数据来源于已加载的缓存数据。后端如需提供搜索 API 可作为增强功能。

5. **通知中心**: `NotificationCenter` 组件展示系统通知，建议通过 WebSocket `notifications` 频道实时推送。

6. **DAG 可视化**: Dagster 页面的 DAG View 根据 `upstream`/`downstream` 字段构建拓扑图，后端需确保这些字段的 Job 名称与实际 `name` 字段一致。

7. **MonthlyHeatmap 共享组件**: `MonthlyHeatmap` 已抽取为共享组件 (`src/components/trading/MonthlyHeatmap.tsx`)，同时用于 Performance 和 Backtest 页面。后端需在两个接口中都返回 `MonthlyReturn[]` 格式数据。

8. **图表颜色**: 所有图表颜色使用 CSS 变量 (`hsl(var(--primary))`, `hsl(var(--profit))` 等)，确保主题一致性。后端无需关心颜色。

9. **数据格式化**: 前端自动处理以下格式化:
   - 字节数 → `12.3 GB` / `450 MB`
   - 大数字 → 千分位逗号
   - 百分比 → 带正负号显示
   - 时间 → 相对时间 / 本地化时间

10. **分页与性能**: 以下接口建议支持分页:
    - `/orders` (可能有大量历史订单)
    - `/backtests/:id/result` 中的 `trades` 数组 (可能有上千条)
    - `/dagster/runs` 中的 `logs` 数组

### 🔧 前端准备替换 Mock 数据的文件

| 文件 | 替换方式 |
|------|---------|
| `src/lib/mock-data.ts` | 用 TanStack Query hooks 替换，创建 `src/lib/api.ts` |
| `src/pages/Index.tsx` | `useQuery` 获取 accounts + positions + strategies |
| `src/pages/Positions.tsx` | `useQuery` 获取 positions |
| `src/pages/Orders.tsx` | `useQuery` 获取 orders |
| `src/pages/Strategies.tsx` | `useQuery` 获取 strategies |
| `src/pages/Performance.tsx` | `useQuery` 获取 equity/monthly/sharpe/distribution |
| `src/pages/Risk.tsx` | `useQuery` 获取 risk metrics/correlation/frontier |
| `src/pages/Backtest.tsx` | `useQuery` 获取 configs + results |
| `src/pages/DagsterJobs.tsx` | `useQuery` 获取 jobs + runs |
| `src/pages/DataManagement.tsx` | `useQuery` 获取 data sources |
| `src/pages/Settings.tsx` | `useQuery` 获取 api-keys/connections/system |

### 📋 对接检查清单

- [ ] 所有 API 响应格式与上述 TypeScript 接口完全匹配
- [ ] Exchange 筛选参数在所有列表接口中生效
- [ ] WebSocket 连接建立后推送初始快照
- [ ] 错误码定义完成并与前端 toast 消息对接
- [ ] CORS 配置允许前端域名访问
- [ ] JWT Token 刷新机制就绪
- [ ] 大数据量接口 (equity curve, trades) 支持分页或流式加载
