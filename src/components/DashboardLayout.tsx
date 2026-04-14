import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ExchangeSelector } from "@/components/trading/ExchangeSelector";
import { CommandPalette } from "@/components/CommandPalette";
import { NotificationCenter } from "@/components/trading/NotificationCenter";
import { Button } from "@/components/ui/button";
import { TradingModeBadge } from "@/components/trading/TradingModeBadge";
import { Exchange, RuntimeSettings, fetchRuntimeSettings } from "@/lib/planc-api";
import { clearAccessToken } from "@/lib/auth-token";
import { useRealtimeUpdates } from "@/lib/useWebSocket";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: (props: { exchangeFilter: Exchange | 'all' }) => React.ReactNode;
}

const REALTIME_CHANNELS = ["notifications"];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [exchangeFilter, setExchangeFilter] = useState<Exchange | 'all'>('all');
  const [clock, setClock] = useState(new Date().toLocaleTimeString());
  const [runtime, setRuntime] = useState<RuntimeSettings | null>(null);
  const { isConnected, isStale } = useRealtimeUpdates({ channels: REALTIME_CHANNELS });

  useEffect(() => {
    let mounted = true;

    const loadRuntime = async () => {
      try {
        const next = await fetchRuntimeSettings();
        if (mounted) {
          setRuntime(next);
        }
      } catch {
        if (mounted) {
          setRuntime(null);
        }
      }
    };

    void loadRuntime();
    const timer = window.setInterval(() => {
      void loadRuntime();
    }, 15_000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const mode = runtime?.tradingMode ?? "disconnected";
  const effectiveMode = isConnected ? mode : "disconnected";

  const handleLogout = () => {
    clearAccessToken();
    navigate("/login", { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {effectiveMode === "paper" ? (
            <div className="w-full border-b border-amber-500/25 bg-amber-500/10 px-4 py-2 text-center text-xs font-medium text-amber-500">
              ⚠ 纸交易模式 · 虚拟资金运行中 · 所有交易结果均为模拟
            </div>
          ) : null}
          <header className="h-12 flex items-center justify-between border-b border-border px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <ExchangeSelector selected={exchangeFilter} onChange={setExchangeFilter} />
              <div className="hidden md:block">
                <CommandPalette />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <div className="hidden sm:flex items-center gap-1.5 text-xs">
                <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-profit" : "bg-loss animate-ping"}`} />
                <span className="text-muted-foreground">{isConnected ? "实时" : "重连中"}</span>
                {isStale ? <span className="text-amber-400">数据可能过期</span> : null}
              </div>
              <TradingModeBadge mode={effectiveMode} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleLogout}
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
              <div className="text-xs font-mono text-muted-foreground hidden sm:block">
                {clock}
              </div>
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-4 overflow-auto">
            {children({ exchangeFilter })}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
