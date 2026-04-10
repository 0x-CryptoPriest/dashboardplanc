import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  LayoutDashboard, Layers, ClipboardList, Brain, FlaskConical,
  LineChart, ShieldCheck, Database, Zap, Settings, Search,
} from "lucide-react";
import { mockStrategies, mockPositions, mockOrders } from "@/lib/mock-data";

const pages = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard, group: "Navigation" },
  { name: "Positions", path: "/positions", icon: Layers, group: "Navigation" },
  { name: "Orders", path: "/orders", icon: ClipboardList, group: "Navigation" },
  { name: "Strategies", path: "/strategies", icon: Brain, group: "Navigation" },
  { name: "Backtest", path: "/backtest", icon: FlaskConical, group: "Navigation" },
  { name: "Performance", path: "/performance", icon: LineChart, group: "Navigation" },
  { name: "Risk Analysis", path: "/risk", icon: ShieldCheck, group: "Navigation" },
  { name: "Data Management", path: "/data", icon: Database, group: "Navigation" },
  { name: "Dagster Jobs", path: "/jobs", icon: Zap, group: "Navigation" },
  { name: "Settings", path: "/settings", icon: Settings, group: "Navigation" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback((path: string) => {
    setOpen(false);
    navigate(path);
  }, [navigate]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-md border border-border bg-muted/50 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Search className="h-3 w-3" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex h-4 items-center gap-0.5 rounded border border-border bg-background px-1 font-mono text-[10px] text-muted-foreground">
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
            {mockStrategies.map((s) => (
              <CommandItem key={s.id} onSelect={() => handleSelect("/strategies")}>
                <Brain className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{s.name}</span>
                <span className={`ml-auto text-xs ${s.status === 'RUNNING' ? 'text-profit' : s.status === 'ERROR' ? 'text-loss' : 'text-muted-foreground'}`}>
                  {s.status}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Open Positions">
            {mockPositions.map((p) => (
              <CommandItem key={p.id} onSelect={() => handleSelect("/positions")}>
                <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{p.symbol}</span>
                <span className={`ml-2 text-xs ${p.side === 'LONG' ? 'text-profit' : 'text-loss'}`}>{p.side}</span>
                <span className={`ml-auto text-xs font-mono ${p.unrealizedPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  ${p.unrealizedPnl.toLocaleString()}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Recent Orders">
            {mockOrders.slice(0, 3).map((o) => (
              <CommandItem key={o.id} onSelect={() => handleSelect("/orders")}>
                <ClipboardList className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{o.symbol}</span>
                <span className={`ml-2 text-xs ${o.side === 'BUY' ? 'text-profit' : 'text-loss'}`}>{o.side}</span>
                <span className="ml-auto text-xs text-muted-foreground">{o.status}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
