import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Brain,
  ClipboardList,
  Database,
  FlaskConical,
  Activity,
  Layers,
  LayoutDashboard,
  LineChart,
  Search,
  Settings,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { fetchTradingOverview } from "@/lib/planc-api";

const pages = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Positions", path: "/positions", icon: Layers },
  { name: "Orders", path: "/orders", icon: ClipboardList },
  { name: "Strategies", path: "/strategies", icon: Brain },
  { name: "Backtest", path: "/backtest", icon: FlaskConical },
  { name: "Performance", path: "/performance", icon: LineChart },
  { name: "Risk Analysis", path: "/risk", icon: ShieldCheck },
  { name: "Data Management", path: "/data", icon: Database },
  { name: "Dagster Jobs", path: "/jobs", icon: Zap },
  { name: "Settings", path: "/settings", icon: Settings },
  { name: "System Health", path: "/system-health", icon: Activity },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const snapshotQuery = useQuery({
    queryKey: ["command-palette", "snapshot"],
    queryFn: fetchTradingOverview,
    staleTime: 30_000,
  });

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (path: string) => {
      setOpen(false);
      navigate(path);
    },
    [navigate],
  );

  const strategies = snapshotQuery.data?.strategies ?? [];
  const positions = snapshotQuery.data?.positions ?? [];
  const orders = snapshotQuery.data?.orders ?? [];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Search className="h-3 w-3" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden h-4 items-center gap-0.5 rounded border border-border bg-background px-1 font-mono text-[10px] text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, strategies, positions..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Pages">
            {pages.map((page) => (
              <CommandItem key={page.path} onSelect={() => handleSelect(page.path)}>
                <page.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                {page.name}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Strategies">
            {snapshotQuery.isLoading ? (
              <CommandItem disabled>Loading strategies...</CommandItem>
            ) : strategies.length > 0 ? (
              strategies.map((strategy) => (
                <CommandItem key={strategy.id} onSelect={() => handleSelect("/strategies")}>
                  <Brain className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{strategy.name}</span>
                  <span
                    className={`ml-auto text-xs ${
                      strategy.status === "RUNNING"
                        ? "text-profit"
                        : strategy.status === "ERROR"
                          ? "text-loss"
                          : "text-muted-foreground"
                    }`}
                  >
                    {strategy.status}
                  </span>
                </CommandItem>
              ))
            ) : (
              <CommandItem disabled>No strategies available</CommandItem>
            )}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Open Positions">
            {snapshotQuery.isLoading ? (
              <CommandItem disabled>Loading positions...</CommandItem>
            ) : positions.length > 0 ? (
              positions.map((position) => (
                <CommandItem key={position.id} onSelect={() => handleSelect("/positions")}>
                  <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{position.symbol}</span>
                  <span className={`ml-2 text-xs ${position.side === "LONG" ? "text-profit" : "text-loss"}`}>
                    {position.side}
                  </span>
                  <span
                    className={`ml-auto text-xs font-mono ${
                      position.unrealizedPnl >= 0 ? "text-profit" : "text-loss"
                    }`}
                  >
                    ${position.unrealizedPnl.toLocaleString()}
                  </span>
                </CommandItem>
              ))
            ) : (
              <CommandItem disabled>No open positions</CommandItem>
            )}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Recent Orders">
            {snapshotQuery.isLoading ? (
              <CommandItem disabled>Loading orders...</CommandItem>
            ) : orders.length > 0 ? (
              orders.slice(0, 3).map((order) => (
                <CommandItem key={order.id} onSelect={() => handleSelect("/orders")}>
                  <ClipboardList className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{order.symbol}</span>
                  <span className={`ml-2 text-xs ${order.side === "BUY" ? "text-profit" : "text-loss"}`}>
                    {order.side}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">{order.status}</span>
                </CommandItem>
              ))
            ) : (
              <CommandItem disabled>No recent orders</CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
