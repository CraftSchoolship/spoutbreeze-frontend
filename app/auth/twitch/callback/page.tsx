// File: d:\spoutbreeze-craft\spoutbreeze-frontend\app\auth\twitch\callback\page.tsx

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircularProgress, Box, Typography, Alert } from "@mui/material";

function TwitchCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>(
    "Completing Twitch authentication..."
  );

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth errors from Twitch
    if (errorParam) {
      setError(errorDescription || errorParam);
      setMessage("Authentication failed");

      // Redirect to settings after showing error
      setTimeout(() => {
        router.push(
          "/settings?tab=integrations&twitch_error=" +
            encodeURIComponent(errorParam)
        );
      }, 2000);
      return;
    }

    // If we have a code, the backend will handle it via cookie auth
    // The backend endpoint will process the token and redirect back
    if (code && state) {
      setMessage("Processing authentication...");

      // The backend's /api/auth/twitch/callback endpoint will:
      // 1. Exchange the code for a token
      // 2. Store it in the database
      // 3. Redirect back to frontend settings page

      // Build the backend callback URL with parameters
      const backendCallbackUrl = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      }/api/auth/twitch/callback?code=${encodeURIComponent(
        code
      )}&state=${encodeURIComponent(state)}`;

      // Redirect to backend to complete the OAuth flow
      window.location.href = backendCallbackUrl;
    } else {
      setError("Missing authorization code");
      setMessage("Invalid callback");

      setTimeout(() => {
        router.push("/settings?tab=integrations&twitch_error=invalid_callback");
      }, 2000);
    }
  }, [searchParams, router]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 3,
        p: 3,
      }}
    >
      {!error ? (
        <>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            {message}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we complete your Twitch connection...
          </Typography>
        </>
      ) : (
        <>
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Authentication Error
            </Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Redirecting back to settings...
          </Typography>
        </>
      )}
    </Box>
  );
}

export default function TwitchCallbackPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress size={60} />
        </Box>
      }
    >
      <TwitchCallbackContent />
    </Suspense>
  );
}
