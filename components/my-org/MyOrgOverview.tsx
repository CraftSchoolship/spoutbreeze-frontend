"use client";

import React from "react";
import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import EventIcon from "@mui/icons-material/Event";
import VideocamIcon from "@mui/icons-material/Videocam";
import PaidIcon from "@mui/icons-material/Paid";

import KpiCard from "@/components/admin/KpiCard";
import type { AnalyticsOverview } from "@/actions/fetchAdminAnalytics";
import type { Organization } from "@/actions/fetchOrganizations";

interface MyOrgOverviewProps {
  org: Organization;
  data: AnalyticsOverview;
}

const formatCurrency = (n: number): string =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const MyOrgOverview: React.FC<MyOrgOverviewProps> = ({ org, data }) => {
  const rollup = data.organizations[0];

  return (
    <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          {org.name}
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Snapshot metrics for everyone in your organization. Updated live;
          membership is managed by platform administrators.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Members"
            value={data.users.total}
            hint={`${data.users.active} active`}
            icon={<GroupIcon />}
            accent="blue"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Events"
            value={data.events.total}
            hint={`${data.events.created_30d} new in 30d`}
            icon={<EventIcon />}
            accent="green"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Streams (30d)"
            value={rollup?.streams_30d ?? 0}
            hint={`${data.streaming.active_now} live now`}
            icon={<VideocamIcon />}
            accent="amber"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Spending (30d)"
            value={formatCurrency(data.revenue.revenue_30d_usd)}
            hint={`${data.revenue.active_subscriptions} active subs`}
            icon={<PaidIcon />}
            accent="slate"
          />
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Activity (last 30 days)
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#f8fafc" }}>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  BBB meetings (all time)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {data.events.bbb_meetings_total}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#f8fafc" }}>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  New members (30d)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {data.users.new_30d}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default MyOrgOverview;
