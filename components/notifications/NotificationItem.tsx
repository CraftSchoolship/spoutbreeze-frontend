"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import StreamOutlinedIcon from "@mui/icons-material/StreamOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import AlarmOutlinedIcon from "@mui/icons-material/AlarmOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import type { Notification, NotificationType } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";

// -------------------------------------------------------------------------
// Icon map
// -------------------------------------------------------------------------

const typeIconMap: Record<NotificationType, React.ReactNode> = {
  stream_started: <StreamOutlinedIcon fontSize="small" sx={{ color: "#0ea5e9" }} />,
  stream_ended: <StreamOutlinedIcon fontSize="small" sx={{ color: "#64748b" }} />,
  stream_error: <StreamOutlinedIcon fontSize="small" sx={{ color: "#ef4444" }} />,
  meeting_started: <VideocamOutlinedIcon fontSize="small" sx={{ color: "#0ea5e9" }} />,
  meeting_ended: <VideocamOutlinedIcon fontSize="small" sx={{ color: "#64748b" }} />,
  recording_ready: <VideocamOutlinedIcon fontSize="small" sx={{ color: "#10b981" }} />,
  channel_connected: <LinkOutlinedIcon fontSize="small" sx={{ color: "#10b981" }} />,
  channel_disconnected: <LinkOutlinedIcon fontSize="small" sx={{ color: "#f59e0b" }} />,
  organizer_added: <GroupAddOutlinedIcon fontSize="small" sx={{ color: "#8b5cf6" }} />,
  event_reminder: <AlarmOutlinedIcon fontSize="small" sx={{ color: "#f59e0b" }} />,
  payment_success: <PaymentOutlinedIcon fontSize="small" sx={{ color: "#10b981" }} />,
  payment_failed: <PaymentOutlinedIcon fontSize="small" sx={{ color: "#ef4444" }} />,
  subscription_upgraded: <PaymentOutlinedIcon fontSize="small" sx={{ color: "#0ea5e9" }} />,
  subscription_downgraded: <PaymentOutlinedIcon fontSize="small" sx={{ color: "#f59e0b" }} />,
  system_announcement: <CampaignOutlinedIcon fontSize="small" sx={{ color: "#0ea5e9" }} />,
  security_alert: <SecurityOutlinedIcon fontSize="small" sx={{ color: "#ef4444" }} />,
};

const priorityDotColor: Record<string, string> = {
  urgent: "#ef4444",
  high: "#f59e0b",
  normal: "#0ea5e9",
  low: "#94a3b8",
};

function getRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
}

// -------------------------------------------------------------------------
// Component
// -------------------------------------------------------------------------

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onDelete,
}) => {
  const icon =
    typeIconMap[notification.notification_type] ?? (
      <NotificationsOutlinedIcon fontSize="small" sx={{ color: "#64748b" }} />
    );

  const dotColor = priorityDotColor[notification.priority] ?? "#94a3b8";

  return (
    <Box
      onClick={() => {
        if (!notification.is_read) onMarkRead(notification.id);
      }}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        px: 2,
        py: 1.5,
        cursor: notification.is_read ? "default" : "pointer",
        backgroundColor: notification.is_read ? "transparent" : "#f0f9ff",
        transition: "background-color 0.15s",
        borderBottom: "1px solid #f1f5f9",
        "&:hover": {
          backgroundColor: "#f8fafc",
        },
        "&:last-child": {
          borderBottom: "none",
        },
        position: "relative",
      }}
    >
      {/* Icon avatar */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          backgroundColor: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        {icon}
      </Box>

      {/* Text content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: notification.is_read ? 500 : 600,
              color: "#1e293b",
              lineHeight: 1.4,
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {notification.title}
          </Typography>
          {/* Priority dot */}
          {!notification.is_read && (
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: dotColor,
                flexShrink: 0,
              }}
            />
          )}
        </Box>
        <Typography
          sx={{
            fontSize: "12px",
            color: "#64748b",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {notification.body}
        </Typography>
        <Typography
          sx={{ fontSize: "11px", color: "#94a3b8", mt: 0.5 }}
        >
          {getRelativeTime(notification.created_at)}
        </Typography>
      </Box>

      {/* Delete button */}
      <Tooltip title="Dismiss" placement="left">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          sx={{
            flexShrink: 0,
            color: "#cbd5e1",
            p: 0.5,
            mt: 0.25,
            transition: "all 0.15s",
            "&:hover": { color: "#ef4444", backgroundColor: "#fef2f2" },
          }}
        >
          <CloseOutlinedIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default NotificationItem;
