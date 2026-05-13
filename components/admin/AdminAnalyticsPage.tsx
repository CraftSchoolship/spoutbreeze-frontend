"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, CircularProgress } from "@mui/material";

import PageLayout, { PageItem } from "@/components/common/PageLayout";
import AdminSidebar from "./AdminSidebar";
import UsersAnalytics from "./UsersAnalytics";
import EventsAnalytics from "./EventsAnalytics";
import StreamingAnalytics from "./StreamingAnalytics";
import RevenueAnalytics from "./RevenueAnalytics";
import OrganizationsAnalytics from "./OrganizationsAnalytics";
import {
  fetchAdminAnalyticsOverview,
  AnalyticsOverview,
} from "@/actions/fetchAdminAnalytics";
import { fetchCurrentUser, isSuperAdmin, User } from "@/actions/fetchUsers";

const AdminAnalyticsPage: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

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
      try {
        const overview = await fetchAdminAnalyticsOverview();
        if (!cancelled) setData(overview);
      } catch (err) {
        console.error("Failed to load admin analytics:", err);
        if (!cancelled) setError("Failed to load analytics. Please try again.");
      }
    };

    load();
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
      component: <UsersAnalytics stats={data.users} currentUser={currentUser} />,
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

  return (
    <PageLayout
      items={items}
      defaultSection="users"
      sidebarComponent={AdminSidebar}
    />
  );
};

export default AdminAnalyticsPage;
