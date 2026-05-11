"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import VideoCallIcon from "@mui/icons-material/VideoCall";

import KpiCard from "./KpiCard";
import type { EventsStats } from "@/actions/fetchAdminAnalytics";

const formatDate = (iso: string) => new Date(iso).toLocaleString();

const statusColor: Record<string, "default" | "success" | "warning" | "info" | "error"> = {
  scheduled: "info",
  live: "success",
  ended: "default",
  cancelled: "warning",
};

const EventsAnalytics: React.FC<{ stats: EventsStats }> = ({ stats }) => {
  const liveCount = stats.by_status["live"] ?? 0;
  const scheduledCount = stats.by_status["scheduled"] ?? 0;

  return (
    <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Events & Meetings
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Scheduled events, live sessions, and BBB meeting activity.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Total events" value={stats.total} icon={<EventIcon />} accent="blue" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Live now"
            value={liveCount}
            hint={`${scheduledCount} scheduled`}
            icon={<LiveTvIcon />}
            accent="green"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Created (7d)"
            value={stats.created_7d}
            hint={`${stats.created_30d} in 30d`}
            icon={<EventAvailableIcon />}
            accent="amber"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="BBB meetings"
            value={stats.bbb_meetings_total}
            hint={`${stats.bbb_meetings_30d} in 30d`}
            icon={<VideoCallIcon />}
            accent="slate"
          />
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Events by status
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(stats.by_status).map(([status, count]) => (
              <Chip
                key={status}
                label={`${status}: ${count}`}
                size="small"
                color={statusColor[status] ?? "default"}
                variant="outlined"
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Latest events
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Starts</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.latest.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell>{e.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={e.status}
                        size="small"
                        color={statusColor[e.status] ?? "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatDate(e.start_date)}</TableCell>
                    <TableCell>{formatDate(e.created_at)}</TableCell>
                  </TableRow>
                ))}
                {stats.latest.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        No events yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default EventsAnalytics;
