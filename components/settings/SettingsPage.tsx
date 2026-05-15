"use client";

import React, { useEffect, useState } from "react";
import PageLayout, { PageItem } from "../common/PageLayout";
import SettingsSidebar from "./SettingsSidebar";
import DeleteAccount from "./deleteAccount/DeleteAccount";
import AccountInfo from "./accountInfo/AccountInfo";
import Integrations from "./integrations/Integrations";
import BillingSettings from "./BillingSettings";
import StreamingSettings from "./streamingSettings/StreamingSettings";
import NotificationSettings from "./notifications/NotificationSettings";
import { fetchCurrentUser } from "@/actions/fetchUsers";
import LinkIcon from "@mui/icons-material/Link";
import PaymentIcon from "@mui/icons-material/Payment";
import VideoSettingsIcon from "@mui/icons-material/VideoSettings";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import ApartmentIcon from "@mui/icons-material/Apartment";
import OrganizationInfo from "./organization/OrganizationInfo";

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        await fetchCurrentUser();
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-500">Loading settings...</span>
        </div>
      </div>
    );
  }

  const baseItems: PageItem[] = [
    {
      key: "account info",
      label: "Account Info",
      icon: "/sidebar/account_info_icon.svg",
      component: <AccountInfo />,
    },
    {
      key: "subscription",
      label: "Subscription & Billing",
      icon: <PaymentIcon fontSize="small" />,
      component: <BillingSettings />,
    },
    {
      key: "streaming",
      label: "Streaming Settings",
      icon: <VideoSettingsIcon fontSize="small" />,
      component: <StreamingSettings />,
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: <NotificationsOutlinedIcon fontSize="small" />,
      component: <NotificationSettings />,
    },
    {
      key: "integrations",
      label: "Integrations",
      icon: <LinkIcon fontSize="small" />,
      component: <Integrations />,
    },
    {
      key: "organization",
      label: "Organization",
      icon: <ApartmentIcon fontSize="small" />,
      component: <OrganizationInfo />,
    },
  ];

  const settingsItems: PageItem[] = [
    ...baseItems,
    {
      key: "delete account",
      label: "Delete Account",
      icon: "/delete_icon_outlined.svg",
      component: <DeleteAccount />,
    },
  ];

  return (
    <PageLayout
      items={settingsItems}
      defaultSection="account info"
      sectionParam="tab"
      sidebarComponent={SettingsSidebar}
    />
  );
};

export default SettingsPage;
