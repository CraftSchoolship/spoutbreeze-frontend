"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import type { NotificationType } from "@/types/notification";
import {
  fetchNotificationPreferences,
  updateNotificationPreference,
} from "@/lib/notificationApi";

// ---------------------------------------------------------------------------
// Static metadata — label, description, category for every notification type
// ---------------------------------------------------------------------------

interface TypeMeta {
  label: string;
  description: string;
}

const TYPE_META: Record<NotificationType, TypeMeta> = {
  stream_started: {
    label: "Stream started",
    description: "When your live stream begins broadcasting",
  },
  stream_ended: {
    label: "Stream ended",
    description: "When your live stream stops broadcasting",
  },
  stream_error: {
    label: "Stream error",
    description: "When a streaming error or interruption occurs",
  },
  meeting_started: {
    label: "Meeting started",
    description: "When a BigBlueButton meeting you're part of begins",
  },
  meeting_ended: {
    label: "Meeting ended",
    description: "When a meeting you attended has ended",
  },
  recording_ready: {
    label: "Recording ready",
    description: "When a meeting recording is available to view",
  },
  organizer_added: {
    label: "Added as organizer",
    description: "When you are added as an organizer to an event",
  },
  event_reminder: {
    label: "Event reminder",
    description: "Reminder sent before a scheduled event starts",
  },
  channel_connected: {
    label: "Channel connected",
    description: "When a streaming platform (Twitch, YouTube…) is connected",
  },
  channel_disconnected: {
    label: "Channel disconnected",
    description: "When a streaming platform connection is lost or revoked",
  },
  payment_success: {
    label: "Payment successful",
    description: "When a charge or subscription payment succeeds",
  },
  payment_failed: {
    label: "Payment failed",
    description: "When a charge or subscription payment fails",
  },
  subscription_upgraded: {
    label: "Plan upgraded",
    description: "When your subscription plan is upgraded",
  },
  subscription_downgraded: {
    label: "Plan downgraded",
    description: "When your subscription plan is downgraded",
  },
  system_announcement: {
    label: "System announcement",
    description: "Platform-wide announcements and maintenance notices",
  },
  security_alert: {
    label: "Security alert",
    description: "Login attempts, password changes and security events",
  },
};

interface Category {
  label: string;
  types: NotificationType[];
}

const CATEGORIES: Category[] = [
  {
    label: "Streams",
    types: ["stream_started", "stream_ended", "stream_error"],
  },
  {
    label: "Meetings & Events",
    types: [
      "meeting_started",
      "meeting_ended",
      "recording_ready",
      "organizer_added",
      "event_reminder",
    ],
  },
  {
    label: "Payments & Subscription",
    types: [
      "payment_success",
      "payment_failed",
      "subscription_upgraded",
      "subscription_downgraded",
    ],
  },
];

// ---------------------------------------------------------------------------
// Default preference values (mirrors backend defaults)
// ---------------------------------------------------------------------------
interface PrefValues {
  in_app_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
}

const DEFAULT_PREF: PrefValues = {
  in_app_enabled: true,
  email_enabled: false,
  push_enabled: false,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const NotificationSettings: React.FC = () => {
  const [prefs, setPrefs] = useState<Record<NotificationType, PrefValues>>(
    () => {
      const base = {} as Record<NotificationType, PrefValues>;
      (Object.keys(TYPE_META) as NotificationType[]).forEach((t) => {
        base[t] = { ...DEFAULT_PREF };
      });
      return base;
    }
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Load existing preferences on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchNotificationPreferences();
        setPrefs((prev) => {
          const next = { ...prev };
          data.items.forEach((p) => {
            const t = p.notification_type as NotificationType;
            if (t in next) {
              next[t] = {
                in_app_enabled: p.in_app_enabled,
                email_enabled: p.email_enabled,
                push_enabled: p.push_enabled,
              };
            }
          });
          return next;
        });
      } catch {
        setError("Failed to load notification preferences.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // -------------------------------------------------------------------------
  // Toggle handler — optimistic update then persist
  // -------------------------------------------------------------------------
  const handleToggle = useCallback(
    async (
      type: NotificationType,
      field: keyof PrefValues,
      value: boolean
    ) => {
      // Optimistic update
      setPrefs((prev) => ({
        ...prev,
        [type]: { ...prev[type], [field]: value },
      }));

      setSaving(`${type}-${field}`);
      try {
        await updateNotificationPreference(type, {
          ...prefs[type],
          [field]: value,
        });
        setToastMsg("Preference saved");
      } catch {
        // Revert on failure
        setPrefs((prev) => ({
          ...prev,
          [type]: { ...prev[type], [field]: !value },
        }));
        setToastMsg("Failed to save preference");
      } finally {
        setSaving(null);
      }
    },
    [prefs]
  );

  // -------------------------------------------------------------------------
  // Column header helpers
  // -------------------------------------------------------------------------
  const columns = useMemo(
    () => [
      {
        key: "in_app_enabled" as keyof PrefValues,
        label: "In-App",
        icon: <NotificationsOutlinedIcon sx={{ fontSize: 16, color: "#64748b" }} />,
        tip: "Show a badge and panel notification inside the app",
      },
      {
        key: "email_enabled" as keyof PrefValues,
        label: "Email",
        icon: <EmailOutlinedIcon sx={{ fontSize: 16, color: "#64748b" }} />,
        tip: "Send an email to your registered address",
      },
      {
        key: "push_enabled" as keyof PrefValues,
        label: "Push",
        icon: <CampaignOutlinedIcon sx={{ fontSize: 16, color: "#64748b" }} />,
        tip: "Browser / device push notifications (if supported)",
      },
    ],
    []
  );

  if (loading) {
    return (
      <Box className="p-4 md:py-10 md:pl-10 flex items-center gap-3">
        <CircularProgress size={22} sx={{ color: "#0ea5e9" }} />
        <Typography sx={{ color: "#64748b", fontSize: 14 }}>
          Loading notification preferences…
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="p-4 md:py-10 md:pl-10">
      <Typography variant="h5" sx={{ fontWeight: 500, mb: 0.5 }}>
        Notification Preferences
      </Typography>
      <Typography variant="body2" sx={{ color: "#64748b", mb: 4 }}>
        Choose which notifications you receive and how they are delivered.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, maxWidth: 720 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 720 }}>
        {CATEGORIES.map((category, ci) => (
          <Paper
            key={category.label}
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            {/* Category header */}
            <Box
              sx={{
                px: 3,
                py: 2,
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>
                {category.label}
              </Typography>
              {/* Column labels */}
              <Box sx={{ display: "flex", gap: 1.5 }}>
                {columns.map((col) => (
                  <Tooltip key={col.key} title={col.tip} placement="top">
                    <Box
                      sx={{
                        width: 72,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 0.25,
                      }}
                    >
                      {col.icon}
                      <Typography
                        sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em" }}
                      >
                        {col.label.toUpperCase()}
                      </Typography>
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            </Box>

            {/* Rows */}
            {category.types.map((type, ri) => {
              const meta = TYPE_META[type];
              const pref = prefs[type];
              return (
                <React.Fragment key={type}>
                  {ri > 0 && <Divider sx={{ borderColor: "#f1f5f9" }} />}
                  <Box
                    sx={{
                      px: 3,
                      py: 1.75,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "background-color 0.15s",
                      "&:hover": { backgroundColor: "#f8fafc" },
                    }}
                  >
                    {/* Text */}
                    <Box sx={{ flex: 1, pr: 2, minWidth: 0 }}>
                      <Typography
                        sx={{ fontSize: 13, fontWeight: 600, color: "#1e293b", mb: 0.25 }}
                      >
                        {meta.label}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>
                        {meta.description}
                      </Typography>
                    </Box>

                    {/* Switches */}
                    <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0 }}>
                      {columns.map((col) => {
                        const isSaving = saving === `${type}-${col.key}`;
                        return (
                          <Box
                            key={col.key}
                            sx={{
                              width: 72,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {isSaving ? (
                              <CircularProgress size={18} sx={{ color: "#0ea5e9" }} />
                            ) : (
                              <Switch
                                size="small"
                                checked={pref[col.key]}
                                onChange={(e) =>
                                  handleToggle(type, col.key, e.target.checked)
                                }
                                sx={{
                                  "& .MuiSwitch-switchBase.Mui-checked": {
                                    color: "#0ea5e9",
                                    "& + .MuiSwitch-track": {
                                      backgroundColor: "#0ea5e9",
                                    },
                                  },
                                }}
                              />
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </React.Fragment>
              );
            })}
          </Paper>
        ))}
      </Box>

      <Snackbar
        open={toastMsg !== null}
        autoHideDuration={2500}
        onClose={() => setToastMsg(null)}
        message={toastMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default NotificationSettings;
