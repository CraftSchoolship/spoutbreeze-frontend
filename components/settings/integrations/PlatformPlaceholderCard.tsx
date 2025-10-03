import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Stack,
  Button,
  Box,
  Chip,
  Tooltip,
} from "@mui/material";
import Image from "next/image";

const BRAND_COLOR = "#27AAFF";

interface PlatformPlaceholderCardProps {
  name: string;
  iconSrc?: string;
  description: string;
  comingSoon?: boolean;
  actions?: React.ReactNode;
  extra?: React.ReactNode;
}

const PlatformPlaceholderCard: React.FC<PlatformPlaceholderCardProps> = ({
  name,
  iconSrc,
  description,
  comingSoon = true,
  actions,
  extra,
}) => {
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: BRAND_COLOR,
        position: "relative",
        overflow: "hidden",
        "&:before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(39,170,255,0.06), rgba(39,170,255,0))",
          pointerEvents: "none",
        },
      }}
    >
      <CardHeader
        sx={{ pb: 1 }}
        title={
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {iconSrc && (
                <Image
                  src={iconSrc}
                  alt={name}
                  width={26}
                  height={26}
                  style={{ objectFit: "contain" }}
                />
              )}
            </Box>
            <Typography variant="h6" fontWeight={600}>
              {name}
            </Typography>
            {comingSoon && (
              <Chip
                size="small"
                label="Coming Soon"
                sx={{
                  backgroundColor: BRAND_COLOR,
                  color: "#fff",
                  fontWeight: 500,
                  height: 22,
                }}
              />
            )}
          </Stack>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {description}
          </Typography>
        }
      />
      <CardContent sx={{ pt: 1 }}>
        <Stack direction="row" spacing={1.2} flexWrap="wrap">
          {comingSoon ? (
            <Tooltip title="Feature not yet available">
              <span>
                <Button
                  variant="contained"
                  disabled
                  sx={{
                    backgroundColor: BRAND_COLOR,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Connect
                </Button>
              </span>
            </Tooltip>
          ) : (
            actions
          )}
          {extra}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PlatformPlaceholderCard;