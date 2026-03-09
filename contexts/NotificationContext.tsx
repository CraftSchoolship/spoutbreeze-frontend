"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Notification } from "@/types/notification";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationsRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllReadNotifications,
} from "@/lib/notificationApi";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

const PAGE_SIZE = 20;

interface NotificationContextValue {
  /** Live notifications list (most-recent first) */
  notifications: Notification[];
  /** Total notification count on the server */
  total: number;
  /** Current unread badge count */
  unreadCount: number;
  /** Whether the initial fetch is happening */
  loading: boolean;
  /** Whether the WS is connected */
  wsConnected: boolean;
  /** Whether more pages are available */
  hasMore: boolean;

  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  markRead: (ids: string[]) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearAllRead: () => Promise<void>;

  /** Whether notification bell tab is open (controls dropdown) */
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  /** Pass false when the user is not authenticated (avoids WS connection) */
  enabled?: boolean;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  enabled = true,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const initializedRef = useRef(false);

  // -------------------------------------------------------------------------
  // HTTP data fetching
  // -------------------------------------------------------------------------

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      const [data, countData] = await Promise.all([
        fetchNotifications(1, PAGE_SIZE, false),
        fetchUnreadCount(),
      ]);
      setNotifications(data.notifications);
      setTotal(data.total);
      setUnreadCount(countData.unread_count);
      setHasMore(data.has_next);
      setPage(1);
    } catch {
      // Silently ignore — user may not be authenticated yet
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const loadMore = useCallback(async () => {
    if (!enabled || !hasMore || loading) return;
    try {
      setLoading(true);
      const next = page + 1;
      const data = await fetchNotifications(next, PAGE_SIZE, false);
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const fresh = data.notifications.filter((n) => !existingIds.has(n.id));
        return [...prev, ...fresh];
      });
      setTotal(data.total);
      setHasMore(data.has_next);
      setPage(next);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [enabled, hasMore, loading, page]);

  // -------------------------------------------------------------------------
  // WebSocket integration
  // -------------------------------------------------------------------------

  const handleWsNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      // Avoid duplicates
      if (prev.some((n) => n.id === notification.id)) return prev;
      return [notification, ...prev];
    });
    setTotal((t) => t + 1);
  }, []);

  const handleWsUnreadCount = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  const { connected: wsConnected } = useNotificationSocket({
    enabled,
    onNotification: handleWsNotification,
    onUnreadCount: handleWsUnreadCount,
  });

  // Initial fetch once on mount
  useEffect(() => {
    if (enabled && !initializedRef.current) {
      initializedRef.current = true;
      refresh();
    }
  }, [enabled, refresh]);

  // Polling fallback: refetch unread count every 60s in case WS is unavailable
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(async () => {
      try {
        const countData = await fetchUnreadCount();
        setUnreadCount(countData.unread_count);
      } catch {
        // ignore — user may have logged out
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [enabled]);

  // -------------------------------------------------------------------------
  // Action handlers
  // -------------------------------------------------------------------------

  const markRead = useCallback(
    async (ids: string[]) => {
      if (!ids.length) return;
      try {
        await markNotificationsRead(ids);
        setNotifications((prev) =>
          prev.map((n) =>
            ids.includes(n.id)
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        );
        // Refetch accurate unread count from the server
        const countData = await fetchUnreadCount();
        setUnreadCount(countData.unread_count);
      } catch {
        // ignore
      }
    },
    []
  );

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch {
      // ignore
    }
  }, []);

  const clearAllRead = useCallback(async () => {
    try {
      await deleteAllReadNotifications();
      setNotifications((prev) => prev.filter((n) => !n.is_read));
      setTotal((t) => {
        const readCount = notifications.filter((n) => n.is_read).length;
        return Math.max(0, t - readCount);
      });
    } catch {
      // ignore
    }
  }, [notifications]);

  const value: NotificationContextValue = {
    notifications,
    total,
    unreadCount,
    loading,
    wsConnected,
    hasMore,
    loadMore,
    refresh,
    markRead,
    markAllRead,
    remove,
    clearAllRead,
    panelOpen,
    setPanelOpen,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
