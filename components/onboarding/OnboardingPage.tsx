"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import ScheduleSendIcon from "@mui/icons-material/ScheduleSend";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import {
  createMyOrganization,
  joinOrganization,
  skipOnboarding,
} from "@/actions/fetchMyOrganization";
import { fetchCurrentUser } from "@/actions/fetchUsers";

type Mode = "choose" | "create" | "join" | "skip" | "post-create" | "post-join";

const OnboardingPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") ?? "";
  const initialModeParam = searchParams.get("mode");

  // Accept ?mode=create|join from external entry points (e.g. Settings →
  // Organization sends unassigned users here with an explicit hint).
  // ?code=<code> still wins if both are present.
  const initialMode: Mode = initialCode
    ? "join"
    : initialModeParam === "create"
      ? "create"
      : initialModeParam === "join"
        ? "join"
        : "choose";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // create form state
  const [orgName, setOrgName] = useState("");
  const [orgDomain, setOrgDomain] = useState("");
  const [verification, setVerification] = useState<{
    recordName: string;
    recordValue: string;
  } | null>(null);

  // join form state
  const [joinCode, setJoinCode] = useState(initialCode);
  const [joinedOrgName, setJoinedOrgName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await fetchCurrentUser();
      if (cancelled) return;
      if (!u) {
        router.replace("/");
        return;
      }
      // Bounce only if they already belong to an org. Users who completed
      // onboarding but landed in Unassigned (chose Skip, or were unassigned
      // by a super-admin) can return here from Settings to set up later.
      if (u.organization_id) {
        router.replace("/home");
        return;
      }
      setAuthChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!authChecked) {
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

  const handleCreate = async () => {
    setError(null);
    setSubmitting(true);
    const { data, error: err } = await createMyOrganization(
      orgName.trim(),
      orgDomain.trim()
    );
    setSubmitting(false);
    if (err || !data) {
      setError(err ?? "Failed to create organization");
      return;
    }
    setVerification({
      recordName: data.verification.verification_record_name ?? "",
      recordValue: data.verification.verification_record_value ?? "",
    });
    setMode("post-create");
  };

  const handleJoin = async () => {
    setError(null);
    setSubmitting(true);
    const { data, error: err } = await joinOrganization(joinCode.trim());
    setSubmitting(false);
    if (err || !data) {
      setError(err ?? "Failed to join organization");
      return;
    }
    setJoinedOrgName(data.organization.name);
    setMode("post-join");
  };

  const handleSkip = async () => {
    setError(null);
    setSubmitting(true);
    const { error: err } = await skipOnboarding();
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    router.replace("/home");
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // best-effort
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Welcome to BlueScale
        </Typography>
        <Typography variant="body1" sx={{ color: "#64748b" }}>
          Tell us how you want to get set up. You can change this later.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {mode === "choose" && (
        <Stack spacing={2}>
          <OnboardingChoiceCard
            icon={<AddBusinessIcon fontSize="large" />}
            title="Create a new organization"
            description="Set up your organization on BlueScale. You'll verify ownership of a domain via a DNS record and you'll become the org admin."
            onClick={() => setMode("create")}
            accent="#0ea5e9"
          />
          <OnboardingChoiceCard
            icon={<GroupAddIcon fontSize="large" />}
            title="Join an existing organization"
            description="Paste an invite code or link your organization admin shared with you."
            onClick={() => setMode("join")}
            accent="#22c55e"
          />
          <OnboardingChoiceCard
            icon={<ScheduleSendIcon fontSize="large" />}
            title="Skip for now"
            description="Continue without an organization. A platform admin can place you later."
            onClick={() => setMode("skip")}
            accent="#94a3b8"
          />
        </Stack>
      )}

      {mode === "create" && (
        <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Create a new organization
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
              You&apos;ll become the first organization admin. We&apos;ll generate a DNS
              TXT record that proves you own the domain.
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Organization name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                disabled={submitting}
                fullWidth
              />
              <TextField
                label="Email domain"
                helperText="Example: harvard.edu — the domain you'll verify ownership of."
                value={orgDomain}
                onChange={(e) => setOrgDomain(e.target.value)}
                required
                disabled={submitting}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
              <Button onClick={() => setMode("choose")} disabled={submitting}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleCreate}
                disabled={submitting || !orgName.trim() || !orgDomain.trim()}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {submitting ? "Creating…" : "Create organization"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {mode === "join" && (
        <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Join an existing organization
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
              Paste the invite code your organization admin shared. (If you have a
              link like <code>/join/org/abc123</code>, the code is the part after
              <code>/org/</code>.)
            </Typography>
            <TextField
              label="Invite code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              required
              disabled={submitting}
              fullWidth
              autoFocus
            />
            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
              <Button onClick={() => setMode("choose")} disabled={submitting}>
                Back
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleJoin}
                disabled={submitting || !joinCode.trim()}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {submitting ? "Joining…" : "Join"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {mode === "skip" && (
        <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Continue without an organization
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
              You&apos;ll be marked as Unassigned. A platform administrator can place
              you into an organization later, or you can come back to this screen
              from Settings.
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button onClick={() => setMode("choose")} disabled={submitting}>
                Back
              </Button>
              <Button
                variant="contained"
                color="inherit"
                onClick={handleSkip}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {submitting ? "Skipping…" : "Continue without organization"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {mode === "post-create" && verification && (
        <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Almost done — verify your domain
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
              Your organization is created and you&apos;re its admin. To finish
              setup, add this DNS TXT record at your domain provider. Verification
              is non-blocking: you can proceed now and verify later from{" "}
              <strong>My Organization</strong>.
            </Typography>
            <Stack spacing={2}>
              <DnsRow label="Type" value="TXT" />
              <DnsRow label="Name" value={verification.recordName} onCopy={copy} />
              <DnsRow label="Value" value={verification.recordValue} onCopy={copy} />
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
              <Button variant="contained" onClick={() => router.replace("/my-org")}>
                Go to My Organization
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {mode === "post-join" && joinedOrgName && (
        <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 36 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  You&apos;ve joined {joinedOrgName}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  You&apos;re now a member with the moderator role. Your org admin
                  can change your role later if needed.
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={() => router.replace("/home")}>
                Continue to home
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

interface OnboardingChoiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  accent: string;
}

const OnboardingChoiceCard: React.FC<OnboardingChoiceCardProps> = ({
  icon,
  title,
  description,
  onClick,
  accent,
}) => (
  <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
    <CardActionArea onClick={onClick}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ color: accent }}>{icon}</Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              {description}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </CardActionArea>
  </Card>
);

interface DnsRowProps {
  label: string;
  value: string;
  onCopy?: (text: string) => void;
}

const DnsRow: React.FC<DnsRowProps> = ({ label, value, onCopy }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      px: 2,
      py: 1.5,
      bgcolor: "#f8fafc",
      borderRadius: 2,
    }}
  >
    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 60, color: "#64748b" }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{ fontFamily: "monospace", flex: 1, wordBreak: "break-all" }}
    >
      {value}
    </Typography>
    {onCopy && (
      <Button
        size="small"
        startIcon={<ContentCopyIcon fontSize="small" />}
        onClick={() => onCopy(value)}
      >
        Copy
      </Button>
    )}
  </Box>
);

export default OnboardingPage;
