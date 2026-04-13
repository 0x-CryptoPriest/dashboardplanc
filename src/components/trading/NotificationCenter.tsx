import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Bell, CheckCircle, Info, X, XCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchConnections, fetchTradingOverview } from "@/lib/planc-api";

type Notification = {
  id: string;
  type: "error" | "warning" | "success" | "info";
  title: string;
  message: string;
  time: string;
};

const typeIcons = { error: XCircle, warning: AlertTriangle, success: CheckCircle, info: Info };
const typeColors = { error: "text-loss", warning: "text-warning", success: "text-profit", info: "text-info" };

function buildNotifications(data?: Awaited<ReturnType<typeof loadNotificationData>>): Notification[] {
  if (!data) {
    return [];
  }

  const notifications: Notification[] = [];

  data.connections
    .filter((connection) => connection.status !== "healthy")
    .forEach((connection) => {
      notifications.push({
        id: `connection-${connection.name}`,
        type: connection.status === "down" ? "error" : "warning",
        title: connection.status === "down" ? "Connection Down" : "Connection Degraded",
        message: `${connection.name} (${connection.endpoint})`,
        time: "Current",
      });
    });

  data.snapshot.strategies
    .filter((strategy) => strategy.status === "ERROR")
    .forEach((strategy) => {
      notifications.push({
        id: `strategy-${strategy.id}`,
        type: "error",
        title: "Strategy Error",
        message: `${strategy.name} requires attention.`,
        time: "Current",
      });
    });

  data.snapshot.orders.slice(0, 4).forEach((order) => {
    notifications.push({
      id: `order-${order.id}`,
      type: order.status === "FILLED" ? "success" : "info",
      title: order.status === "FILLED" ? "Order Filled" : "Order Update",
      message: `${order.side} ${order.symbol} · ${order.status}`,
      time: order.time === "—" ? "Current" : order.time,
    });
  });

  if (notifications.length === 0) {
    notifications.push({
      id: "system-ok",
      type: "success",
      title: "All Systems Operational",
      message: "Connections, strategies, and orders look healthy.",
      time: "Current",
    });
  }

  return notifications;
}

async function loadNotificationData() {
  const [connections, snapshot] = await Promise.all([fetchConnections(), fetchTradingOverview()]);
  return { connections, snapshot };
}

export function NotificationCenter() {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  const notificationQuery = useQuery({
    queryKey: ["notification-center"],
    queryFn: loadNotificationData,
    staleTime: 30_000,
  });

  const notifications = useMemo(
    () => buildNotifications(notificationQuery.data).filter((item) => !dismissedIds.includes(item.id)),
    [dismissedIds, notificationQuery.data],
  );

  const unread = notifications.filter((notification) => !readIds.includes(notification.id)).length;

  function markAllRead() {
    setReadIds((current) => Array.from(new Set([...current, ...notifications.map((item) => item.id)])));
  }

  function dismiss(id: string) {
    setDismissedIds((current) => (current.includes(id) ? current : [...current, id]));
    setReadIds((current) => (current.includes(id) ? current : [...current, id]));
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative rounded-md p-1.5 transition-colors hover:bg-muted">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-loss text-[9px] font-bold text-white animate-pulse-glow">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-[10px] text-primary hover:text-primary/80">
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[360px] overflow-auto">
          {notificationQuery.isLoading ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Loading notifications...</div>
          ) : notificationQuery.error instanceof Error ? (
            <div className="p-6 text-center text-xs text-loss">{notificationQuery.error.message}</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((notification) => {
              const Icon = typeIcons[notification.type];
              const isRead = readIds.includes(notification.id);

              return (
                <div
                  key={notification.id}
                  className={`flex gap-2.5 border-b border-border/50 px-3 py-2.5 transition-colors hover:bg-muted/30 last:border-0 ${
                    !isRead ? "bg-primary/5" : ""
                  }`}
                >
                  <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${typeColors[notification.type]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground">{notification.title}</span>
                      <button onClick={() => dismiss(notification.id)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{notification.message}</p>
                    <span className="text-[10px] text-muted-foreground/60">{notification.time}</span>
                  </div>
                  {!isRead && <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
