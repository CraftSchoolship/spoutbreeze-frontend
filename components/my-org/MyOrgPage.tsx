"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, CircularProgress } from "@mui/material";

import PageLayout, { PageItem } from "@/components/common/PageLayout";
import MyOrgSidebar from "./MyOrgSidebar";
import MyOrgOverview from "./MyOrgOverview";
import MyOrgMembers from "./MyOrgMembers";
import {
  fetchMyOrganization,
  fetchMyOrgOverview,
} from "@/actions/fetchMyOrganization";
import { fetchCurrentUser, hasRole, User } from "@/actions/fetchUsers";
import type { Organization } from "@/actions/fetchOrganizations";
import type { AnalyticsOverview } from "@/actions/fetchAdminAnalytics";

const MyOrgPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await fetchCurrentUser();
      if (cancelled) return;
      if (!u || !hasRole(u, "admin")) {
        router.replace("/home");
        return;
      }
      setUser(u);
      setAuthChecked(true);
      const [o, ov] = await Promise.all([fetchMyOrganization(), fetchMyOrgOverview()]);
      if (cancelled) return;
      if (!o) {
        setError(
          "You're an organization admin but you're not currently assigned to an organization. Ask a platform administrator to assign you."
        );
        return;
      }
      setOrg(o);
      setOverview(ov);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

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

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">{error}</Alert>
      </Box>
    );
  }

  if (!org || !overview || !user) {
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
      key: "overview",
      label: "Overview",
      component: <MyOrgOverview org={org} data={overview} />,
    },
    {
      key: "members",
      label: "Members",
      component: <MyOrgMembers currentUser={user} />,
    },
  ];

  return (
    <PageLayout
      items={items}
      defaultSection="overview"
      sidebarComponent={MyOrgSidebar}
    />
  );
};

export default MyOrgPage;
