import axiosInstance from "@/lib/axios";
import type {
  Notification,
  NotificationListResponse,
  UnreadCountResponse,
  MarkReadRequest,
  MarkReadResponse,
  NotificationPreferenceListResponse,
  NotificationType,
} from "@/types/notification";

const BASE = "/api/notifications";

export interface PaginatedNotifications {
  notifications: Notification[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export async function fetchNotifications(
  page = 1,
  pageSize = 20,
  unreadOnly = false
): Promise<PaginatedNotifications> {
  const res = await axiosInstance.get<NotificationListResponse>(BASE, {
    params: { page, page_size: pageSize, unread_only: unreadOnly },
  });
  const data = res.data;
  return {
    notifications: data.items,
    total: data.total,
    unread_count: data.unread_count,
    page: data.page,
    page_size: data.page_size,
    has_next: data.page * data.page_size < data.total,
  };
}

export async function fetchUnreadCount(): Promise<UnreadCountResponse> {
  const res = await axiosInstance.get<UnreadCountResponse>(
    `${BASE}/unread-count`
  );
  return res.data;
}

export async function markNotificationsRead(
  notificationIds: string[]
): Promise<MarkReadResponse> {
  const body: MarkReadRequest = { notification_ids: notificationIds };
  const res = await axiosInstance.post<MarkReadResponse>(
    `${BASE}/mark-read`,
    body
  );
  return res.data;
}

export async function markAllNotificationsRead(): Promise<MarkReadResponse> {
  const res = await axiosInstance.post<MarkReadResponse>(
    `${BASE}/mark-all-read`
  );
  return res.data;
}

export async function deleteNotification(id: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`);
}

export async function deleteAllReadNotifications(): Promise<void> {
  await axiosInstance.delete(BASE);
}

export async function fetchNotificationPreferences(): Promise<
  NotificationPreferenceListResponse
> {
  const res = await axiosInstance.get<NotificationPreferenceListResponse>(
    `${BASE}/preferences`
  );
  return res.data;
}

export async function updateNotificationPreference(
  notificationType: NotificationType,
  updates: { in_app_enabled?: boolean; email_enabled?: boolean; push_enabled?: boolean }
): Promise<void> {
  await axiosInstance.put(
    `${BASE}/preferences`,
    { notification_type: notificationType, ...updates }
  );
}
