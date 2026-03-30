export type NotificationType =
  | "stream_started"
  | "stream_ended"
  | "stream_error"
  | "meeting_started"
  | "meeting_ended"
  | "recording_ready"
  | "channel_connected"
  | "channel_disconnected"
  | "organizer_added"
  | "event_reminder"
  | "payment_success"
  | "payment_failed"
  | "subscription_upgraded"
  | "subscription_downgraded"
  | "system_announcement"
  | "security_alert";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export type DeliveryStatus = "pending" | "delivered" | "failed" | "skipped";

export interface Notification {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  body: string;
  data: string | null;
  priority: NotificationPriority;
  send_in_app: boolean;
  send_email: boolean;
  send_push: boolean;
  in_app_status: DeliveryStatus;
  email_status: DeliveryStatus;
  push_status: DeliveryStatus;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
  // has_next is derived: (page * page_size) < total
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface MarkReadRequest {
  notification_ids: string[];
}

export interface MarkReadResponse {
  updated_count: number;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  in_app_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferenceListResponse {
  items: NotificationPreference[];
}

// WebSocket event shapes
export type WSEventType =
  | "connected"
  | "notification"
  | "unread_count"
  | "pong"
  | "error";

export interface WSConnectedEvent {
  event: "connected";
  unread_count: number;
}

export interface WSNotificationEvent {
  event: "notification";
  notification: Notification;
  unread_count: number;
}

export interface WSUnreadCountEvent {
  event: "unread_count";
  unread_count: number;
}

export interface WSPongEvent {
  event: "pong";
}

export interface WSErrorEvent {
  event: "error";
  message: string;
}

export type WSIncomingEvent =
  | WSConnectedEvent
  | WSNotificationEvent
  | WSUnreadCountEvent
  | WSPongEvent
  | WSErrorEvent;
