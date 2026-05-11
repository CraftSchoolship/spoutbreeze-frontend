"use client";

import React from "react";
import { Box } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import EventIcon from "@mui/icons-material/Event";
import VideocamIcon from "@mui/icons-material/Videocam";
import PaidIcon from "@mui/icons-material/Paid";

import type { PageItem } from "@/components/common/PageLayout";

const iconMap: Record<string, React.ReactNode> = {
  users: <GroupIcon fontSize="small" />,
  events: <EventIcon fontSize="small" />,
  streaming: <VideocamIcon fontSize="small" />,
  revenue: <PaidIcon fontSize="small" />,
};

interface AdminSidebarProps {
  items: PageItem[];
  activeKey: string;
  onItemClick: (key: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  items,
  activeKey,
  onItemClick,
}) => {
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

export default AdminSidebar;
