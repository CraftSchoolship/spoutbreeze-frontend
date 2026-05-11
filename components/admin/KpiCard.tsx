"use client";

import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  accent?: "blue" | "green" | "amber" | "red" | "slate";
}

const accentColors: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  blue: "#0ea5e9",
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  slate: "#64748b",
};

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  hint,
  icon,
  accent = "blue",
}) => {
  const color = accentColors[accent];
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#64748b", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}
          >
            {label}
          </Typography>
          {icon ? (
            <Box sx={{ color, display: "flex", alignItems: "center" }}>{icon}</Box>
          ) : null}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.1 }}>
          {value}
        </Typography>
        {hint ? (
          <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5, fontSize: 13 }}>
            {hint}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
