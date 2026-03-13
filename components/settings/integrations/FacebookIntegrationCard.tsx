/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Box,
  Tooltip,
  Divider,
  Skeleton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  getFacebookAuthUrl,
  getFacebookTokenStatus,
  revokeFacebookToken,
  getFacebookPages,
  FacebookTokenStatus,
  FacebookPage,
} from "@/actions/facebookIntegration";
import Image from "next/image";
import PagesIcon from "@mui/icons-material/Flag";

const BRAND_COLOR = "#1877F2";

const FacebookIntegrationCard: React.FC = () => {
  const [status, setStatus] = useState<FacebookTokenStatus | null>(null);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justRevoked, setJustRevoked] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await getFacebookTokenStatus();
      setStatus(s);

      // If connected, also load pages
      if (s.has_token) {
        try {
          const pagesData = await getFacebookPages();
          setPages(pagesData.pages || []);
        } catch {
          // Pages fetch may fail — not critical
          setPages([]);
        }
      } else {
        setPages([]);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load Facebook status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();

    // Check for OAuth callback parameters
    const params = new URLSearchParams(window.location.search);
    const success = params.get("facebook_success");
    const fbError = params.get("facebook_error");

    if (success) {
      setError(null);
      setJustRevoked(false);
      window.history.replaceState({}, "", window.location.pathname);
    } else if (fbError) {
      const errorMessages: Record<string, string> = {
        access_denied:
          "You denied access to Facebook. Please try again if you want to connect.",
        auth_failed: "Failed to authenticate with Facebook. Please try again.",
        invalid_callback: "Invalid OAuth callback. Please try again.",
      };
      setError(
        errorMessages[fbError] || `Authentication error: ${fbError}`
      );
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleConnect = async () => {
    setWorking(true);
    setError(null);
    try {
      const { authorization_url } = await getFacebookAuthUrl();
      window.location.href = authorization_url;
    } catch (e: any) {
      setError(e?.message || "Failed to initiate Facebook authentication");
      setWorking(false);
    }
  };

  const handleRevoke = async () => {
    setWorking(true);
    setError(null);
    try {
      await revokeFacebookToken();
      setJustRevoked(true);
      setPages([]);
      await loadStatus();
    } catch (e: any) {
      setError(e?.message || "Failed to revoke token");
    } finally {
      setWorking(false);
    }
  };

  const timeInfo = useMemo(() => {
    if (!status?.has_token || !status.expires_at) return null;
    const expiry = new Date(status.expires_at).getTime();
    const now = Date.now();
    const diffMs = expiry - now;
    if (diffMs <= 0) return "Expired";
    const mins = Math.floor(diffMs / 1000 / 60);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) {
      const remMin = mins % 60;
      return `${hrs}h ${remMin}m`;
    }
    const days = Math.floor(hrs / 24);
    const remHrs = hrs % 24;
    return `${days}d ${remHrs}h`;
  }, [status]);

  const chipProps = status?.has_token
    ? status.is_expired
      ? { label: "Expired", color: "error" as const }
      : status.expires_soon
        ? { label: "Expires Soon", color: "warning" as const }
        : { label: "Connected", color: "success" as const }
    : null;

  return (
    <Card
      variant="outlined"
      sx={{
        position: "relative",
        overflow: "hidden",
        borderColor: BRAND_COLOR,
        "&:before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(24,119,242,0.08), rgba(24,119,242,0))",
          pointerEvents: "none",
        },
      }}
    >
      <CardHeader
        sx={{
          pb: 1,
          "& .MuiCardHeader-title": { fontWeight: 600 },
        }}
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
              <Image
                src="/facebook_icon.svg"
                alt="Facebook"
                width={30}
                height={30}
              />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              Facebook
            </Typography>
            {chipProps && (
              <Chip
                size="small"
                {...chipProps}
                sx={{
                  fontWeight: 500,
                  "&.MuiChip-colorSuccess": {
                    backgroundColor: "#28c76f",
                    color: "#fff",
                  },
                  "&.MuiChip-colorError": {
                    backgroundColor: "#ff4d4f",
                    color: "#fff",
                  },
                  "&.MuiChip-colorWarning": {
                    backgroundColor: "#ff9800",
                    color: "#fff",
                  },
                }}
              />
            )}
            {loading && <CircularProgress size={16} thickness={5} />}
          </Stack>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Link your Facebook account to stream to your profile or company
            page.
          </Typography>
        }
      />
      <CardContent sx={{ pt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {justRevoked && (
          <Alert
            severity="info"
            sx={{ mb: 2 }}
            onClose={() => setJustRevoked(false)}
          >
            Facebook connection revoked
          </Alert>
        )}

        {loading && (
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Skeleton height={20} width="60%" />
            <Skeleton height={18} width="40%" />
            <Skeleton height={36} width="50%" />
          </Stack>
        )}

        {!loading && !status?.has_token && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            No active Facebook connection. Connect to start streaming.
          </Typography>
        )}

        {!loading && status?.has_token && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              background:
                "linear-gradient(135deg, rgba(24,119,242,0.06), rgba(24,119,242,0))",
            }}
          >
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Profile:
                </Typography>
                <Typography variant="body2">
                  {status.is_expired
                    ? "Expired"
                    : status.expires_soon
                      ? "Expires Soon"
                      : "Active"}
                </Typography>
                {timeInfo && !status.is_expired && (
                  <Tooltip title="Approximate time remaining">
                    <Chip
                      size="small"
                      variant="outlined"
                      label={timeInfo}
                      sx={{
                        borderColor: BRAND_COLOR,
                        color: BRAND_COLOR,
                        fontWeight: 500,
                        height: 22,
                      }}
                    />
                  </Tooltip>
                )}
              </Stack>
              {status.is_expired && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ fontWeight: 500 }}
                >
                  Token could not be auto-refreshed. Please disconnect and
                  reconnect.
                </Typography>
              )}
            </Stack>
          </Box>
        )}

        {/* Connected Pages */}
        {!loading && status?.has_token && pages.length > 0 && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              Connected Pages
            </Typography>
            <List dense disablePadding>
              {pages.map((page) => (
                <ListItem key={page.page_id} disablePadding sx={{ py: 0.3 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <PagesIcon
                      fontSize="small"
                      sx={{ color: BRAND_COLOR }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        Page ID: {page.page_id}
                      </Typography>
                    }
                    secondary={
                      page.is_active
                        ? "Active"
                        : "Inactive"
                    }
                  />
                  <Chip
                    size="small"
                    label={page.is_active ? "Ready" : "Inactive"}
                    color={page.is_active ? "success" : "default"}
                    sx={{ height: 20, fontSize: "0.7rem" }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" spacing={1.2} flexWrap="wrap">
          {!loading && !status?.has_token && (
            <Button
              variant="contained"
              onClick={handleConnect}
              disabled={working}
              sx={{
                backgroundColor: BRAND_COLOR,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#166FE5",
                },
              }}
            >
              {working ? "Opening..." : "Connect Facebook"}
            </Button>
          )}

          {!loading && status?.has_token && (
            <>
              <Button
                variant="outlined"
                onClick={handleRevoke}
                disabled={working}
                color="error"
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                {working ? "Revoking..." : "Disconnect"}
              </Button>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FacebookIntegrationCard;
