"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import PageLayout, { PageItem } from "@/components/common/PageLayout";
import AdminSidebar from "./AdminSidebar";
import UsersAnalytics from "./UsersAnalytics";
import EventsAnalytics from "./EventsAnalytics";
import StreamingAnalytics from "./StreamingAnalytics";
import RevenueAnalytics from "./RevenueAnalytics";
import OrganizationsAnalytics from "./OrganizationsAnalytics";
import {
  AnalyticsOverview,
  OrgFilterValue,
  fetchAdminAnalyticsOverview,
} from "@/actions/fetchAdminAnalytics";
import { fetchCurrentUser, isSuperAdmin, User } from "@/actions/fetchUsers";
import { Organization, fetchOrganizations } from "@/actions/fetchOrganizations";

const ALL_VALUE = "__all__";
const UNASSIGNED_VALUE = "unassigned";

const AdminAnalyticsPage: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [orgFilter, setOrgFilter] = useState<OrgFilterValue>(null);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadOverview = useCallback(
    async (filter: OrgFilterValue, opts: { showSpinner?: boolean } = {}) => {
      if (opts.showSpinner) setRefreshing(true);
      try {
        const overview = await fetchAdminAnalyticsOverview(filter);
        setData(overview);
        setError(null);
      } catch (err) {
        console.error("Failed to load admin analytics:", err);
        setError("Failed to load analytics. Please try again.");
      } finally {
        if (opts.showSpinner) setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const user = await fetchCurrentUser();
      if (cancelled) return;
      if (!user || !isSuperAdmin(user)) {
        router.replace("/home");
        return;
      }
      setCurrentUser(user);
      setAuthChecked(true);
      const [, allOrgs] = await Promise.all([
        loadOverview(null),
        fetchOrganizations(),
      ]);
      if (!cancelled) setOrgs(allOrgs);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [router, loadOverview]);

  const handleFilterChange = (next: OrgFilterValue) => {
    setOrgFilter(next);
    loadOverview(next, { showSpinner: true });
  };

  const filterSelectValue =
    orgFilter === null ? ALL_VALUE : orgFilter === UNASSIGNED_VALUE ? UNASSIGNED_VALUE : orgFilter;

  const activeOrgName =
    orgFilter === null
      ? null
      : orgFilter === UNASSIGNED_VALUE
        ? "Unassigned"
        : orgs.find((o) => o.id === orgFilter)?.name ?? "Selected organization";

  if (!authChecked) {
    return (
      <Box
        sx={{
          minHeight: "calc(100vh - 72px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box
        sx={{
          minHeight: "calc(100vh - 72px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  const items: PageItem[] = [
    {
      key: "users",
      label: "Users",
      component: (
        <UsersAnalytics
          stats={data.users}
          currentUser={currentUser}
          orgFilter={orgFilter}
        />
      ),
    },
    { key: "events", label: "Events", component: <EventsAnalytics stats={data.events} /> },
    {
      key: "streaming",
      label: "Streaming",
      component: <StreamingAnalytics stats={data.streaming} />,
    },
    { key: "revenue", label: "Revenue", component: <RevenueAnalytics stats={data.revenue} /> },
    {
      key: "organizations",
      label: "Organizations",
      component: <OrganizationsAnalytics stats={data.organizations} />,
    },
  ];

  const filterHeader = (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        bgcolor: "#ffffff",
        px: { xs: 2, sm: 3 },
        py: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
            Filter by organization
          </Typography>
          {activeOrgName && (
            <Chip
              label={activeOrgName}
              size="small"
              onDelete={() => handleFilterChange(null)}
              sx={{ bgcolor: "#e0f2fe", color: "#0369a1" }}
            />
          )}
          {refreshing && <CircularProgress size={16} />}
        </Stack>

        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel id="admin-org-filter-label">Organization</InputLabel>
          <Select
            labelId="admin-org-filter-label"
            label="Organization"
            value={filterSelectValue}
            onChange={(e) => {
              const v = e.target.value;
              if (v === ALL_VALUE) handleFilterChange(null);
              else handleFilterChange(v as OrgFilterValue);
            }}
          >
            <MenuItem value={ALL_VALUE}>
              <em>All organizations (platform-wide)</em>
            </MenuItem>
            <MenuItem value={UNASSIGNED_VALUE}>Unassigned (no organization)</MenuItem>
            {orgs.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.name}
                {!o.is_active ? " (inactive)" : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      {orgFilter !== null && (
        <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#64748b" }}>
          Users, Events, Streaming, and Revenue tabs are scoped to this selection. The
          Organizations tab remains the platform-wide breakdown.
        </Typography>
      )}
    </Box>
  );

  return (
    <PageLayout
      items={items}
      defaultSection="users"
      sidebarComponent={AdminSidebar}
      header={filterHeader}
    />
  );
};

export default AdminAnalyticsPage;
