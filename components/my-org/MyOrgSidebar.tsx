"use client";

import React from "react";
import { Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DnsIcon from "@mui/icons-material/Dns";
import GroupIcon from "@mui/icons-material/Group";
import LinkIcon from "@mui/icons-material/Link";

import type { PageItem } from "@/components/common/PageLayout";

const iconMap: Record<string, React.ReactNode> = {
  overview: <DashboardIcon fontSize="small" />,
  members: <GroupIcon fontSize="small" />,
  domains: <DnsIcon fontSize="small" />,
  invite: <LinkIcon fontSize="small" />,
};

interface MyOrgSidebarProps {
  items: PageItem[];
  activeKey: string;
  onItemClick: (key: string) => void;
}

const MyOrgSidebar: React.FC<MyOrgSidebarProps> = ({ items, activeKey, onItemClick }) => {
  return (
    <div className="flex flex-row sm:flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto sm:overflow-visible">
      {items.map((item, index) => {
        const isActive = activeKey === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onItemClick(item.key)}
            className={`
              flex items-center py-3 px-4 sm:py-4 sm:px-5 cursor-pointer
              whitespace-nowrap transition-all duration-200
              ${
                isActive
                  ? "bg-gradient-to-r from-sky-50 to-teal-50 border-l-0 sm:border-l-4 border-b-4 sm:border-b-0 border-sky-500"
                  : "hover:bg-slate-50"
              }
              ${index === 0 ? "rounded-l-2xl sm:rounded-t-2xl sm:rounded-bl-none" : ""}
              ${index === items.length - 1 ? "rounded-r-2xl sm:rounded-b-2xl sm:rounded-tr-none" : ""}
            `}
          >
            <Box
              sx={{
                mr: 1.5,
                display: "flex",
                alignItems: "center",
                color: isActive ? "#0ea5e9" : "#94a3b8",
              }}
            >
              {iconMap[item.key] ?? null}
            </Box>
            <span
              className={`text-sm font-medium transition-colors duration-200 ${
                isActive ? "text-slate-800" : "text-slate-500"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default MyOrgSidebar;
