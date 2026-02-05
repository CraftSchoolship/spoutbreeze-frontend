/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Box,
  Button,
  Tooltip,
  Divider,
  Skeleton,
} from "@mui/material";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  getYouTubeAuthUrl,
  getYouTubeTokenStatus,
  revokeYouTubeToken,
  // startYouTubeConnection,
  YouTubeTokenStatus,
} from "@/actions/youtubeIntegration";

const BRAND_COLOR = "#27AAFF";

const YouTubeIntegrationCard: React.FC = () => {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<YouTubeTokenStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justRevoked, setJustRevoked] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await getYouTubeTokenStatus();
      setStatus(s);
    } catch (e: any) {
      setError(e?.message || "Failed to load YouTube status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();

    // Check for OAuth callback parameters
    const youtubeSuccess = searchParams.get("youtube_success");
    const youtubeError = searchParams.get("youtube_error");

    if (youtubeSuccess === "true") {
      setSuccessMessage("Successfully connected to YouTube!");
      setError(null);
      // Reload status to get fresh token info
      setTimeout(() => {
        loadStatus();
      }, 500);

      // Clean URL after 3 seconds
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("youtube_success");
        window.history.replaceState({}, "", url.toString());
        setSuccessMessage(null);
      }, 3000);
    } else if (youtubeError) {
      const errorMessages: Record<string, string> = {
        access_denied:
          "You denied access to YouTube. Please try again if you want to connect.",
        auth_failed: "Failed to authenticate with YouTube. Please try again.",
        invalid_callback: "Invalid OAuth callback. Please try again.",
      };

      setError(
        errorMessages[youtubeError] || `Authentication error: ${youtubeError}`
      );

      // Clean URL after showing error
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("youtube_error");
        window.history.replaceState({}, "", url.toString());
      }, 5000);
    }
  }, [searchParams]);

  const handleConnect = async () => {
    setWorking(true);
    setError(null);
    try {
      const { authorization_url } = await getYouTubeAuthUrl();
      // Redirect current window to YouTube OAuth
      window.location.href = authorization_url;
    } catch (e: any) {
      setError(e?.message || "Failed to initiate YouTube authentication");
      setWorking(false);
    }
  };

  const handleRevoke = async () => {
    setWorking(true);
    setError(null);
    try {
      await revokeYouTubeToken();
      setJustRevoked(true);
      await loadStatus();
    } catch (e: any) {
      setError(e?.message || "Failed to revoke token");
    } finally {
      setWorking(false);
    }
  };

  // const handleStart = async () => {
  //   setWorking(true);
  //   setError(null);
  //   try {
  //     await startYouTubeConnection();
  //     setSuccessMessage("Chat polling started successfully!");
  //     setTimeout(() => setSuccessMessage(null), 3000);
  //   } catch (e: any) {
  //     setError(e?.message || "Failed to start YouTube chat polling");
  //   } finally {
  //     setWorking(false);
  //   }
  // };

  const timeInfo = useMemo(() => {
    if (!status?.has_token || !status.expires_at) return null;
    const expiry = new Date(status.expires_at).getTime();
    const now = Date.now();
    const diffMs = expiry - now;
    if (diffMs <= 0) return "Expired";
    const mins = Math.floor(diffMs / 1000 / 60);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const remMin = mins % 60;
    return `${hrs}h ${remMin}m`;
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
            "linear-gradient(135deg, rgba(39,170,255,0.08), rgba(39,170,255,0))",
          pointerEvents: "none",
        },
      }}
    >
      <CardHeader
        sx={{ pb: 1, "& .MuiCardHeader-title": { fontWeight: 600 } }}
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
                src="/youtube_icon.svg"
                alt="YouTube"
                width={26}
                height={26}
              />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              YouTube
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
            Link your YouTube channel to enable chat relay &amp; interactions.
            <strong style={{ marginLeft: 4, fontWeight: 600 }}>
              YouTube uses a daily API quota for chat and live features
            </strong>
            {" "}
            (see
            <a
              href="https://developers.google.com/youtube/v3/determine_quota_cost"
              target="_blank"
              rel="noreferrer"
              style={{ marginLeft: 4, color: BRAND_COLOR, textDecoration: "underline" }}
            >
              quota cost
            </a>
            
            and
            <a
              href="https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits"
              target="_blank"
              rel="noreferrer"
              style={{ marginLeft: 4, color: BRAND_COLOR, textDecoration: "underline" }}
            >
              quota &amp; compliance
            </a>
            ).
          </Typography>
        }
      />
      <CardContent sx={{ pt: 1 }}>
        {successMessage && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage(null)}
          >
            {successMessage}
          </Alert>
        )}
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
            YouTube token revoked
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
            No active YouTube connection. Connect to start syncing chat.
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
                "linear-gradient(135deg, rgba(39,170,255,0.06), rgba(39,170,255,0))",
            }}
          >
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Status:
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
              <Typography variant="body2">
                Expires at:{" "}
                <strong>{new Date(status.expires_at).toLocaleString()}</strong>
              </Typography>
              {status.is_expired && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ fontWeight: 500 }}
                >
                  Token expired. Disconnect & reconnect to refresh.
                </Typography>
              )}
            </Stack>
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
                "&:hover": { backgroundColor: "#159BEF" },
              }}
            >
              {working ? "Connecting..." : "Connect YouTube"}
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
              {/* <Button
                variant="contained"
                onClick={handleStart}
                disabled={working || status.is_expired}
                sx={{
                  backgroundColor: BRAND_COLOR,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#159BEF" },
                }}
              >
                {working ? "Starting..." : "Start Chat Polling"}
              </Button> */}
              <Button
                variant="text"
                onClick={loadStatus}
                disabled={working}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  color: BRAND_COLOR,
                  "&:hover": { backgroundColor: "rgba(39,170,255,0.08)" },
                }}
              >
                Refresh
              </Button>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default YouTubeIntegrationCard;
