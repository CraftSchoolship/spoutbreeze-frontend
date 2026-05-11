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
import PaidIcon from "@mui/icons-material/Paid";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import KpiCard from "./KpiCard";
import type { RevenueStats } from "@/actions/fetchAdminAnalytics";

const formatCurrency = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

const formatDate = (iso: string) => new Date(iso).toLocaleString();

const planColor: Record<string, "default" | "success" | "primary" | "secondary"> = {
  free: "default",
  pro: "primary",
  enterprise: "secondary",
};

const RevenueAnalytics: React.FC<{ stats: RevenueStats }> = ({ stats }) => {
  return (
    <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Revenue & Subscriptions
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Subscription distribution and 30-day revenue. Revenue is computed
          from successful payment transactions.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Revenue (30d)"
            value={formatCurrency(stats.revenue_30d_usd)}
            icon={<PaidIcon />}
            accent="green"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Active subs"
            value={stats.active_subscriptions}
            icon={<WorkspacePremiumIcon />}
            accent="blue"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Transactions (30d)"
            value={stats.transactions_30d_count}
            icon={<ReceiptLongIcon />}
            accent="amber"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Failed (7d)"
            value={stats.failed_payments_7d}
            icon={<ErrorOutlineIcon />}
            accent="red"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Subscriptions by plan
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Object.entries(stats.subs_by_plan).map(([plan, count]) => (
                  <Chip
                    key={plan}
                    label={`${plan}: ${count}`}
                    size="small"
                    color={planColor[plan] ?? "default"}
                    variant="outlined"
                  />
                ))}
                {Object.keys(stats.subs_by_plan).length === 0 && (
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                    No subscriptions.
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
                Subscriptions by status
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Object.entries(stats.subs_by_status).map(([status, count]) => (
                  <Chip
                    key={status}
                    label={`${status}: ${count}`}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: "#cbd5e1", color: "#334155" }}
                  />
                ))}
                {Object.keys(stats.subs_by_status).length === 0 && (
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                    No subscriptions.
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
            Latest transactions
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>When</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.latest_transactions.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>
                      {formatCurrency(t.amount, (t.currency || "usd").toUpperCase())}
                    </TableCell>
                    <TableCell>{t.transaction_type}</TableCell>
                    <TableCell>
                      <Chip
                        label={t.status}
                        size="small"
                        color={
                          t.status === "succeeded" || t.status === "paid"
                            ? "success"
                            : t.status === "failed"
                              ? "error"
                              : "default"
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatDate(t.created_at)}</TableCell>
                  </TableRow>
                ))}
                {stats.latest_transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        No transactions yet.
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

export default RevenueAnalytics;
