"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Notification, WSIncomingEvent } from "@/types/notification";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Convert http(s):// → ws(s):// */
function toWsUrl(httpUrl: string): string {
  return httpUrl.replace(/^http/, "ws");
}

const WS_URL = `${toWsUrl(NEXT_PUBLIC_API_URL)}/api/notifications/ws`;

const PING_INTERVAL_MS = 25_000;
const RECONNECT_DELAY_MS = 3_000;
const MAX_RECONNECT_ATTEMPTS = 6;

export interface UseNotificationSocketOptions {
  enabled?: boolean; // Set to false when user is not logged in
  onNotification?: (notification: Notification) => void;
  onUnreadCount?: (count: number) => void;
}

export interface UseNotificationSocketResult {
  connected: boolean;
  markRead: (notificationIds: string[]) => void;
  disconnect: () => void;
}

export function useNotificationSocket({
  enabled = true,
  onNotification,
  onUnreadCount,
}: UseNotificationSocketOptions): UseNotificationSocketResult {
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const mountedRef = useRef(true);
  const [connected, setConnected] = useState(false);

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const clearPingInterval = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  };

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const markRead = useCallback(
    (notificationIds: string[]) => {
      send({ type: "mark_read", notification_ids: notificationIds });
    },
    [send]
  );

  const connectWs = useCallback(() => {
    if (!mountedRef.current || !enabled) return;

    clearPingInterval();
    clearReconnectTimeout();

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) {
        ws.close();
        return;
      }
      // Send auth message — backend falls back to HTTP-only cookie automatically
      ws.send(JSON.stringify({ type: "auth" }));

      // Start keepalive pings
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, PING_INTERVAL_MS);
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return;
      let parsed: WSIncomingEvent;
      try {
        parsed = JSON.parse(event.data as string) as WSIncomingEvent;
      } catch {
        return;
      }

      if (parsed.event === "connected") {
        setConnected(true);
        reconnectAttemptsRef.current = 0;
        onUnreadCount?.(parsed.unread_count);
      } else if (parsed.event === "notification") {
        onNotification?.(parsed.notification);
        onUnreadCount?.(parsed.unread_count);
      } else if (parsed.event === "unread_count") {
        onUnreadCount?.(parsed.unread_count);
      }
      // pong / error: no-op
    };

    ws.onclose = () => {
      clearPingInterval();
      setConnected(false);

      if (!mountedRef.current || !enabled) return;
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) return;

      reconnectAttemptsRef.current += 1;
      const delay = RECONNECT_DELAY_MS * reconnectAttemptsRef.current;
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWs();
      }, delay);
    };

    ws.onerror = () => {
      // onclose fires after onerror — reconnect logic runs there
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const disconnect = useCallback(() => {
    clearPingInterval();
    clearReconnectTimeout();
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) {
      connectWs();
    }

    return () => {
      mountedRef.current = false;
      clearPingInterval();
      clearReconnectTimeout();
      wsRef.current?.close();
      wsRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { connected, markRead, disconnect };
}
