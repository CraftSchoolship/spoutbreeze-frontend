"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import { joinOrganization } from "@/actions/fetchMyOrganization";
import { fetchCurrentUser } from "@/actions/fetchUsers";

const JoinByCodePage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const code = (params?.code as string) ?? "";

  const [loading, setLoading] = useState(true);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await fetchCurrentUser();
      if (cancelled) return;
      if (!u) {
        // Middleware should have redirected; defensive fallback.
        router.replace(`/?next=/join/org/${encodeURIComponent(code)}`);
        return;
      }
      // If they haven't completed onboarding, hand off to /onboarding with the
      // code pre-filled — keeps the "first login" funnel in one place.
      if (!u.has_completed_onboarding) {
        router.replace(`/onboarding?code=${encodeURIComponent(code)}`);
        return;
      }
      if (u.organization_id) {
        setAlreadyJoined(true);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [code, router]);

  const handleJoin = async () => {
    setError(null);
    setSubmitting(true);
    const { error: err } = await joinOrganization(code);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    router.replace("/home");
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Join an organization
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
            Invite code: <strong>{code}</strong>
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {alreadyJoined ? (
            <Stack spacing={2}>
              <Alert severity="info">
                You already belong to an organization. To switch, ask a platform
                administrator to reassign you.
              </Alert>
              <Button variant="contained" onClick={() => router.replace("/home")}>
                Continue
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button onClick={() => router.replace("/home")} disabled={submitting}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleJoin}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {submitting ? "Joining…" : "Confirm join"}
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default JoinByCodePage;
