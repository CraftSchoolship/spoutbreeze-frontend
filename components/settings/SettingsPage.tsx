"use client";

import React, { useEffect, useState } from "react";
import PageLayout, { PageItem } from "../common/PageLayout";
import SettingsSidebar from "./SettingsSidebar";
import DeleteAccount from "./deleteAccount/DeleteAccount";
import AccountInfo from "./accountInfo/AccountInfo";
import AccessControl from "./accessControl/AccessControl";
import Integrations from "./integrations/Integrations";
import BillingSettings from "./BillingSettings";
import StreamingSettings from "./streamingSettings/StreamingSettings";
import { fetchCurrentUser, User, isAdmin } from "@/actions/fetchUsers";
import LinkIcon from "@mui/icons-material/Link";
import PaymentIcon from "@mui/icons-material/Payment";
import VideoSettingsIcon from "@mui/icons-material/VideoSettings";

const SettingsPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchCurrentUser();
        setUser(userData);
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
      key: "integrations",
      label: "Integrations",
      icon: <LinkIcon fontSize="small" />,
      component: <Integrations />,
    },
  ];

  const adminItems: PageItem[] = user && isAdmin(user) ? [
    {
      key: "access control",
      label: "Access Control",
      icon: "/sidebar/accessControl_icon.svg",
      component: <AccessControl />,
    },
  ] : [];

  const settingsItems: PageItem[] = [
    ...baseItems,
    ...adminItems,
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
