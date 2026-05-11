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
import VideocamIcon from "@mui/icons-material/Videocam";
import PodcastsIcon from "@mui/icons-material/Podcasts";
import HistoryIcon from "@mui/icons-material/History";
import LinkIcon from "@mui/icons-material/Link";

import KpiCard from "./KpiCard";
import type { StreamingStats } from "@/actions/fetchAdminAnalytics";

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString() : "—";

const StreamingAnalytics: React.FC<{ stats: StreamingStats }> = ({ stats }) => {
  return (
    <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Streaming Activity
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Live broadcasts, recent sessions, and connected platform accounts.
          Historical data begins from the day this dashboard shipped.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Live now"
            value={stats.active_now}
            icon={<PodcastsIcon />}
            accent="green"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Last 24h"
            value={stats.sessions_24h}
            icon={<VideocamIcon />}
            accent="blue"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Last 30d"
            value={stats.sessions_30d}
            hint={`${stats.sessions_total} all-time`}
            icon={<HistoryIcon />}
            accent="amber"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Connected accounts"
            value={Object.values(stats.connections_by_provider).reduce(
              (a, b) => a + b,
              0
            )}
            icon={<LinkIcon />}
            accent="slate"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Sessions by platform (30d)
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Object.entries(stats.by_platform).map(([p, count]) => (
                  <Chip
                    key={p}
                    label={`${p}: ${count}`}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: "#cbd5e1", color: "#334155" }}
                  />
                ))}
                {Object.keys(stats.by_platform).length === 0 && (
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                    No sessions in the last 30 days.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Connections by provider
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Object.entries(stats.connections_by_provider).map(([p, count]) => (
                  <Chip
                    key={p}
                    label={`${p}: ${count}`}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: "#cbd5e1", color: "#334155" }}
                  />
                ))}
                {Object.keys(stats.connections_by_provider).length === 0 && (
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                    No active connections.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Latest stream sessions
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Stream ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Platform</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Started</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ended</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.latest.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                      {s.stream_id.slice(0, 16)}…
                    </TableCell>
                    <TableCell>{s.platform ?? "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={s.status}
                        size="small"
                        color={s.status === "active" ? "success" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatDate(s.started_at)}</TableCell>
                    <TableCell>{formatDate(s.ended_at)}</TableCell>
                  </TableRow>
                ))}
                {stats.latest.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        No sessions recorded yet.
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

export default StreamingAnalytics;
