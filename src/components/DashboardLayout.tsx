import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ExchangeSelector } from "@/components/trading/ExchangeSelector";
import { CommandPalette } from "@/components/CommandPalette";
import { NotificationCenter } from "@/components/trading/NotificationCenter";
import { Exchange } from "@/lib/mock-data";
import { useState } from "react";
import { Wifi } from "lucide-react";

interface DashboardLayoutProps {
  children: (props: { exchangeFilter: Exchange | 'all' }) => React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [exchangeFilter, setExchangeFilter] = useState<Exchange | 'all'>('all');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
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
                <Wifi className="h-3 w-3 text-profit" />
                <span className="text-muted-foreground">Connected</span>
              </div>
              <div className="text-xs font-mono text-muted-foreground hidden sm:block">
                {new Date().toLocaleTimeString()}
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
