import React from "react";
import Chip from "@mui/material/Chip";

interface LiveBadgeProps {
  show: boolean;
  variant?: "default" | "pulse";
}

const LiveBadge: React.FC<LiveBadgeProps> = ({ show, variant = "default" }) => {
  if (!show) return null;

  return (
    <Chip
      label="LIVE"
      size="small"
      sx={{
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        color: "white",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.5px",
        height: "22px",
        borderRadius: "6px",
        boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
        "& .MuiChip-label": {
          padding: "0 10px",
        },
        ...(variant === "pulse" && {
          animation: "pulse 2s infinite",
          "@keyframes pulse": {
            "0%": {
              opacity: 1,
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
            },
            "50%": {
              opacity: 0.85,
              boxShadow: "0 2px 12px rgba(239, 68, 68, 0.6)",
            },
            "100%": {
              opacity: 1,
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
            },
          },
        }),
      }}
    />
  );
};

export default LiveBadge;
