"use client";

import React, { useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";

import { verifyMyOrgDomain } from "@/actions/fetchMyOrganization";

interface DomainVerificationBannerProps {
  pendingDomain: string;
  recordName: string;
  recordValue: string;
  onVerified: () => void;
}

const DomainVerificationBanner: React.FC<DomainVerificationBannerProps> = ({
  pendingDomain,
  recordName,
  recordValue,
  onVerified,
}) => {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // best-effort
    }
  };

  const check = async () => {
    setChecking(true);
    setError(null);
    setHint(null);
    const { data, error: err } = await verifyMyOrgDomain();
    setChecking(false);
    if (err || !data) {
      setError(err ?? "Failed to verify.");
      return;
    }
    if (data.verified) {
      onVerified();
    } else {
      setHint("No matching TXT record yet. DNS can take a few minutes; try again shortly.");
    }
  };

  return (
    <Alert severity="warning" sx={{ borderRadius: 3 }}>
      <AlertTitle sx={{ fontWeight: 700 }}>
        Verify your domain <span style={{ fontFamily: "monospace" }}>{pendingDomain}</span>
      </AlertTitle>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Add this DNS TXT record at your domain provider, then click <strong>Check now</strong>.
        Until the record resolves, new signups with this email domain won&apos;t auto-join your
        organization.
      </Typography>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <DnsRow label="Type" value="TXT" />
        <DnsRow label="Name" value={recordName} onCopy={copy} />
        <DnsRow label="Value" value={recordValue} onCopy={copy} />
      </Stack>
      {hint && (
        <Typography variant="caption" sx={{ display: "block", color: "#64748b", mb: 1 }}>
          {hint}
        </Typography>
      )}
      {error && (
        <Typography variant="caption" sx={{ display: "block", color: "#b91c1c", mb: 1 }}>
          {error}
        </Typography>
      )}
      <Button
        variant="contained"
        size="small"
        startIcon={checking ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon />}
        onClick={check}
        disabled={checking}
      >
        {checking ? "Checking…" : "Check now"}
      </Button>
    </Alert>
  );
};

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
      px: 1.5,
      py: 1,
      bgcolor: "rgba(255,255,255,0.6)",
      borderRadius: 1,
    }}
  >
    <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 50, color: "#64748b" }}>
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

export default DomainVerificationBanner;
