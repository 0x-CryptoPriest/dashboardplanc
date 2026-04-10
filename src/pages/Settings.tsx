import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { Exchange } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { Key, Shield, Wifi, Bell, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

function APIKeyCard({ name, exchange, status, lastUsed, delay }: { name: string; exchange: string; status: 'active' | 'expired' | 'error'; lastUsed: string; delay: number }) {
  const [showKey, setShowKey] = useState(false);
  const statusColors = { active: 'text-profit', expired: 'text-warning', error: 'text-loss' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-lg border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{name}</span>
        </div>
        <div className={`flex items-center gap-1 text-xs ${statusColors[status]}`}>
          {status === 'active' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {status.toUpperCase()}
        </div>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Exchange</span>
          <span className="font-mono text-foreground">{exchange}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">API Key</span>
          <div className="flex items-center gap-1">
            <span className="font-mono text-foreground">{showKey ? 'aK7x...mR9pQ2w' : '••••••••••••'}</span>
            <button onClick={() => setShowKey(!showKey)} className="text-muted-foreground hover:text-foreground">
              {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Last Used</span>
          <span className="font-mono text-foreground">{lastUsed}</span>
        </div>
      </div>
    </motion.div>
  );
}

function ConnectionCheck({ name, endpoint, latency, status, delay }: { name: string; endpoint: string; latency: string; status: 'healthy' | 'degraded' | 'down'; delay: number }) {
  const colors = { healthy: 'text-profit', degraded: 'text-warning', down: 'text-loss' };
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
    >
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${status === 'healthy' ? 'bg-profit' : status === 'degraded' ? 'bg-warning' : 'bg-loss'}`} />
        <div>
          <div className="text-sm text-foreground">{name}</div>
          <div className="text-[10px] font-mono text-muted-foreground">{endpoint}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-xs font-mono ${colors[status]}`}>{latency}</div>
        <div className={`text-[10px] ${colors[status]}`}>{status}</div>
      </div>
    </motion.div>
  );
}

function Content({ exchangeFilter: _ }: { exchangeFilter: Exchange | 'all' }) {
  return (
    <PageTransition>
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-foreground">Settings</h1>

      <Tabs defaultValue="api-keys" className="w-full">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <APIKeyCard name="Binance Main" exchange="Binance Futures" status="active" lastUsed="2 min ago" delay={0} />
            <APIKeyCard name="Binance Read-Only" exchange="Binance Spot" status="active" lastUsed="5 min ago" delay={0.05} />
            <APIKeyCard name="Hyperliquid Trading" exchange="Hyperliquid" status="active" lastUsed="3 min ago" delay={0.1} />
            <APIKeyCard name="IBKR Gateway" exchange="Interactive Brokers" status="expired" lastUsed="2 days ago" delay={0.15} />
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" />
              Connection Health
            </h2>
            <div className="space-y-0">
              <ConnectionCheck name="Binance WebSocket" endpoint="wss://fstream.binance.com" latency="12ms" status="healthy" delay={0} />
              <ConnectionCheck name="Binance REST API" endpoint="https://fapi.binance.com" latency="45ms" status="healthy" delay={0.05} />
              <ConnectionCheck name="Hyperliquid API" endpoint="https://api.hyperliquid.xyz" latency="89ms" status="healthy" delay={0.1} />
              <ConnectionCheck name="DuckDB Instance" endpoint="localhost:5432" latency="2ms" status="healthy" delay={0.15} />
              <ConnectionCheck name="Dagster Daemon" endpoint="localhost:3000" latency="5ms" status="healthy" delay={0.2} />
              <ConnectionCheck name="Parquet Store" endpoint="/data/parquet/" latency="1ms" status="healthy" delay={0.25} />
              <ConnectionCheck name="IBKR Gateway" endpoint="localhost:4001" latency="—" status="down" delay={0.3} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Notification Preferences
            </h2>
            {[
              { label: 'Strategy Error Alerts', desc: 'Notify when a strategy encounters an error', enabled: true },
              { label: 'Large Drawdown Warning', desc: 'Alert when drawdown exceeds threshold (-5%)', enabled: true },
              { label: 'Order Fill Notifications', desc: 'Notify on order fills and partial fills', enabled: false },
              { label: 'Daily PnL Summary', desc: 'Send daily performance summary at EOD', enabled: true },
              { label: 'Connection Loss Alert', desc: 'Alert when exchange connection is lost', enabled: true },
              { label: 'Dagster Job Failures', desc: 'Notify when scheduled jobs fail', enabled: true },
              { label: 'Data Gap Warnings', desc: 'Alert on data quality issues', enabled: false },
              { label: 'Margin Call Warning', desc: 'Alert when margin ratio exceeds 80%', enabled: true },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <div className="text-sm text-foreground">{n.label}</div>
                  <div className="text-xs text-muted-foreground">{n.desc}</div>
                </div>
                <Switch defaultChecked={n.enabled} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              System Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {[
                { label: 'Engine', value: 'NautilusTrader v1.182' },
                { label: 'Data Engine', value: 'Polars 0.20.8 + DuckDB 0.10.1' },
                { label: 'Scheduler', value: 'Dagster 1.6.10' },
                { label: 'Trading Gateway', value: 'CCXT 4.2.18' },
                { label: 'Risk Engine', value: 'skfolio 0.3.0' },
                { label: 'Reporting', value: 'QuantStats 0.0.62' },
                { label: 'Python', value: '3.11.8' },
                { label: 'OS', value: 'Ubuntu 22.04 LTS' },
              ].map(s => (
                <div key={s.label} className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-mono text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </PageTransition>
  );
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <Content exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
