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
import GroupIcon from "@mui/icons-material/Group";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import HowToRegIcon from "@mui/icons-material/HowToReg";

import KpiCard from "./KpiCard";
import type { UsersStats } from "@/actions/fetchAdminAnalytics";

const formatDate = (iso: string) => new Date(iso).toLocaleString();

const UsersAnalytics: React.FC<{ stats: UsersStats }> = ({ stats }) => {
  const adminCount = stats.by_role["admin"] ?? 0;

  return (
    <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Users & Growth
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Account totals, growth, and role distribution.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Total users" value={stats.total} icon={<GroupIcon />} accent="blue" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Active"
            value={stats.active}
            hint={`${stats.inactive} inactive`}
            icon={<HowToRegIcon />}
            accent="green"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="New (7d)"
            value={stats.new_7d}
            hint={`${stats.new_30d} in 30d`}
            icon={<PersonAddIcon />}
            accent="amber"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Admins"
            value={adminCount}
            icon={<AdminPanelSettingsIcon />}
            accent="slate"
          />
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Roles distribution
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(stats.by_role).map(([role, count]) => (
              <Chip
                key={role}
                label={`${role}: ${count}`}
                size="small"
                variant="outlined"
                sx={{ borderColor: "#cbd5e1", color: "#334155" }}
              />
            ))}
            {Object.keys(stats.by_role).length === 0 && (
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                No roles recorded yet.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Latest signups
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Roles</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.latest.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "#475569" }}>
                        {u.roles || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.is_active ? "Active" : "Inactive"}
                        size="small"
                        color={u.is_active ? "success" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatDate(u.created_at)}</TableCell>
                  </TableRow>
                ))}
                {stats.latest.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        No users yet.
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

export default UsersAnalytics;
