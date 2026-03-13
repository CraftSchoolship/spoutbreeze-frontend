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
} from "@mui/material";
import {
  getTwitchAuthUrl,
  getTwitchTokenStatus,
  revokeTwitchToken,
  TwitchTokenStatus,
} from "@/actions/twitchIntegration";
import Image from "next/image";

const BRAND_COLOR = "#27AAFF";

const TwitchIntegrationCard: React.FC = () => {
  const [status, setStatus] = useState<TwitchTokenStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justRevoked, setJustRevoked] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await getTwitchTokenStatus();
      setStatus(s);
    } catch (e: any) {
      setError(e?.message || "Failed to load Twitch status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();

    // Check for OAuth callback parameters
    const params = new URLSearchParams(window.location.search);
    const success = params.get("twitch_success");
    const error = params.get("twitch_error");

    if (success) {
      setError(null);
      setJustRevoked(false);
      // Optionally show success message
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (error) {
      setError(`Twitch authentication failed: ${error}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleConnect = async () => {
    setWorking(true);
    setError(null);
    try {
      const { authorization_url } = await getTwitchAuthUrl();
      // Redirect current window instead of opening new tab
      window.location.href = authorization_url;
    } catch (e: any) {
      setError(e?.message || "Failed to initiate Twitch authentication");
      setWorking(false);
    }
  };

  const handleRevoke = async () => {
    setWorking(true);
    setError(null);
    try {
      await revokeTwitchToken();
      setJustRevoked(true);
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
                src="/twitch_icon.svg"
                alt="Twitch"
                width={30}
                height={30}
              />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              Twitch
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
            Link your Twitch account to enable chat relay & interactions.
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
            Twitch token revoked
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
            No active Twitch connection. Connect to start syncing chat.
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
                  Token could not be auto-refreshed. Please disconnect and
                  reconnect.
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
                "&:hover": {
                  backgroundColor: "#159BEF",
                },
              }}
            >
              {working ? "Opening..." : "Connect Twitch"}
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

export default TwitchIntegrationCard;
