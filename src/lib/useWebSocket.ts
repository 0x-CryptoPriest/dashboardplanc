import { toast } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/lib/auth-token";

export type RealtimeConnectionState = "connecting" | "connected" | "reconnecting" | "disconnected";
export type RealtimePayload = Record<string, unknown>;

type UseRealtimeUpdatesOptions = {
  enabled?: boolean;
  channels?: string[];
  onMessage?: (payload: RealtimePayload) => void;
};

const DEFAULT_WS_URL = "ws://127.0.0.1:8000/v1/ws";
const RECONNECT_DELAY_MS = 2_000;
const STALE_AFTER_MS = 5_000;
const EMPTY_CHANNELS: string[] = [];

type NotificationPayload = {
  id?: string;
  event?: string;
  title?: string;
  message?: string;
  severity?: "info" | "warning" | "error";
};

function getWebSocketUrl(): string {
  const configured = (import.meta.env.VITE_WS_URL as string | undefined)?.trim();
  const base = configured && configured.length > 0 ? configured : DEFAULT_WS_URL;
  const token = getAccessToken();
  if (!token) {
    return base;
  }

  try {
    const parsed = new URL(base, window.location.origin);
    parsed.searchParams.set("token", token);
    return parsed.toString();
  } catch {
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}token=${encodeURIComponent(token)}`;
  }
}

function parsePayload(raw: string): RealtimePayload | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as RealtimePayload;
  } catch {
    return null;
  }
}

export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions = {}) {
  const { enabled = true, onMessage } = options;
  const channels = options.channels ?? EMPTY_CHANNELS;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const intentionalCloseRef = useRef(false);
  const subscribedChannelsRef = useRef<Set<string>>(new Set());
  const channelsRef = useRef<string[]>(channels);
  const onMessageRef = useRef<typeof onMessage>(onMessage);

  const [connectionState, setConnectionState] = useState<RealtimeConnectionState>(
    enabled ? "connecting" : "disconnected",
  );
  const [lastMessage, setLastMessage] = useState<RealtimePayload | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [disconnectedAt, setDisconnectedAt] = useState<number | null>(enabled ? Date.now() : null);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    channelsRef.current = channels;
  }, [channels]);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled) {
      intentionalCloseRef.current = true;
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      wsRef.current?.close();
      wsRef.current = null;
      subscribedChannelsRef.current.clear();
      setConnectionState("disconnected");
      return;
    }

    intentionalCloseRef.current = false;
    const wsUrl = getWebSocketUrl();

    const connect = () => {
      setConnectionState((prev) => (prev === "connected" ? prev : "connecting"));
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState("connected");
        setReconnectCount(0);
        setDisconnectedAt(null);
        subscribedChannelsRef.current.clear();
        for (const channel of channelsRef.current) {
          ws.send(JSON.stringify({ action: "subscribe", channel }));
          subscribedChannelsRef.current.add(channel);
        }
      };

      ws.onmessage = (event) => {
        if (typeof event.data !== "string") {
          return;
        }

        const payload = parsePayload(event.data);
        if (!payload) {
          return;
        }

        setLastMessage(payload);
        const notification = payload as NotificationPayload;
        if (
          notification.event === "notification" &&
          typeof notification.message === "string" &&
          notification.message.length > 0
        ) {
          const title = typeof notification.title === "string" ? notification.title : undefined;
          if (notification.severity === "error") {
            toast.error(notification.message, { description: title });
          } else if (notification.severity === "warning") {
            toast.warning(notification.message, { description: title });
          } else {
            toast.info(notification.message, { description: title });
          }
        }
        onMessageRef.current?.(payload);
      };

      ws.onclose = () => {
        wsRef.current = null;
        subscribedChannelsRef.current.clear();
        setDisconnectedAt(Date.now());
        if (intentionalCloseRef.current || !enabled) {
          setConnectionState("disconnected");
          return;
        }

        setConnectionState("reconnecting");
        setReconnectCount((count) => count + 1);
        reconnectTimerRef.current = window.setTimeout(connect, RECONNECT_DELAY_MS);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      intentionalCloseRef.current = true;
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      wsRef.current?.close();
      wsRef.current = null;
      subscribedChannelsRef.current.clear();
    };
  }, [enabled]);

  useEffect(() => {
    if (connectionState === "connected" || disconnectedAt === null) {
      return;
    }
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [connectionState, disconnectedAt]);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const previous = subscribedChannelsRef.current;
    const next = new Set(channels);

    for (const channel of previous) {
      if (!next.has(channel)) {
        ws.send(JSON.stringify({ action: "unsubscribe", channel }));
      }
    }
    for (const channel of next) {
      if (!previous.has(channel)) {
        ws.send(JSON.stringify({ action: "subscribe", channel }));
      }
    }
    subscribedChannelsRef.current = next;
  }, [channels]);

  const sendMessage = (payload: RealtimePayload) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return false;
    }
    ws.send(JSON.stringify(payload));
    return true;
  };

  return {
    isConnected: connectionState === "connected",
    isStale:
      disconnectedAt !== null &&
      connectionState !== "connected" &&
      now - disconnectedAt >= STALE_AFTER_MS,
    connectionState,
    lastMessage,
    reconnectCount,
    sendMessage,
  };
}
