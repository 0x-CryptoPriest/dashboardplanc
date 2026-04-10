import { useState } from "react";
import { Bell, AlertTriangle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Notification {
  id: string;
  type: "error" | "warning" | "success" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: "n1", type: "error", title: "Strategy Error", message: "Stat Arb feed timeout on ETH-USDT", time: "32 min ago", read: false },
  { id: "n2", type: "warning", title: "Margin Alert", message: "Hyperliquid margin ratio at 45%", time: "1h ago", read: false },
  { id: "n3", type: "success", title: "Order Filled", message: "BUY 50,000 DOGE-USDT filled at $0.165", time: "2h ago", read: true },
  { id: "n4", type: "error", title: "Dagster Job Failed", message: "generate_report failed: insufficient data", time: "14h ago", read: true },
  { id: "n5", type: "info", title: "Daily PnL Summary", message: "Net PnL: +$10,000.55 (+0.54%)", time: "1d ago", read: true },
  { id: "n6", type: "warning", title: "Data Gap", message: "ARB-USDT missing 1h candle 22:00-23:00", time: "1d ago", read: true },
];

const typeIcons = { error: XCircle, warning: AlertTriangle, success: CheckCircle, info: Info };
const typeColors = { error: "text-loss", warning: "text-warning", success: "text-profit", info: "text-info" };

export function NotificationCenter() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  const dismiss = (id: string) => setNotifications((ns) => ns.filter((n) => n.id !== id));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-1.5 rounded-md hover:bg-muted transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-loss text-[9px] text-white flex items-center justify-center font-bold animate-pulse-glow">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-[10px] text-primary hover:text-primary/80">
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[360px] overflow-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((n) => {
              const Icon = typeIcons[n.type];
              return (
                <div
                  key={n.id}
                  className={`flex gap-2.5 px-3 py-2.5 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                >
                  <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${typeColors[n.type]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{n.title}</span>
                      <button onClick={() => dismiss(n.id)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{n.message}</p>
                    <span className="text-[10px] text-muted-foreground/60">{n.time}</span>
                  </div>
                  {!n.read && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
