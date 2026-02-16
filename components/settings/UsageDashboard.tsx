"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  CircularProgress,
  Stack,
  Alert,
} from "@mui/material";
import SpeedIcon from "@mui/icons-material/Speed";
import { getUsageStats, UsageStats } from "@/actions/subscription";

export default function UsageDashboard() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getUsageStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load usage stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!stats) return null;

  const streamUsagePercent =
    stats.max_concurrent_streams !== null
      ? Math.min((stats.active_streams / stats.max_concurrent_streams) * 100, 100)
      : 0;

  const isNearStreamLimit =
    stats.max_concurrent_streams !== null &&
    stats.active_streams >= stats.max_concurrent_streams * 0.8;

  const isTrialExpiringSoon =
    stats.trial_days_remaining !== null && stats.trial_days_remaining <= 3;

  return (
    <Card sx={{ mb: 4, borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <SpeedIcon color="action" />
          <Typography variant="h6" fontWeight={700}>
            Usage Overview
          </Typography>
        </Box>

        {/* Warnings */}
        {isTrialExpiringSoon && stats.trial_days_remaining !== null && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            Your trial expires in {stats.trial_days_remaining} day{stats.trial_days_remaining !== 1 ? "s" : ""}.
            Upgrade to continue streaming.
          </Alert>
        )}
        {isNearStreamLimit && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            You are approaching your concurrent stream limit.
            Consider upgrading for more capacity.
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Active Streams */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Active Streams
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.active_streams} / {stats.max_concurrent_streams ?? "Unlimited"}
              </Typography>
            </Box>
            {stats.max_concurrent_streams !== null && (
              <LinearProgress
                variant="determinate"
                value={streamUsagePercent}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "#e8eaf0",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    bgcolor:
                      streamUsagePercent >= 90
                        ? "#ef4444"
                        : streamUsagePercent >= 70
                          ? "#f59e0b"
                          : "#3b82f6",
                  },
                }}
              />
            )}
          </Box>

          {/* Max Quality */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" fontWeight={600}>
              Max Stream Quality
            </Typography>
            <Chip label={stats.max_quality} size="small" color="primary" variant="outlined" />
          </Box>

          {/* Trial Status */}
          {stats.trial_days_remaining !== null && (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" fontWeight={600}>
                Trial Days Remaining
              </Typography>
              <Chip
                label={`${stats.trial_days_remaining} day${stats.trial_days_remaining !== 1 ? "s" : ""}`}
                size="small"
                color={stats.trial_days_remaining <= 3 ? "warning" : "info"}
              />
            </Box>
          )}

          {/* Plan Status */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" fontWeight={600}>
              Plan Status
            </Typography>
            <Chip
              label={stats.plan_status.toUpperCase()}
              size="small"
              color={
                stats.plan_status === "active"
                  ? "success"
                  : stats.plan_status === "trialing"
                    ? "info"
                    : stats.plan_status === "past_due"
                      ? "warning"
                      : "default"
              }
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
