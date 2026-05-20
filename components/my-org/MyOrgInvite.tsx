"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";

import {
  getMyOrgInvite,
  rotateMyOrgInvite,
  OrganizationInviteResponse,
} from "@/actions/fetchMyOrganization";

const MyOrgInvite: React.FC = () => {
  const [invite, setInvite] = useState<OrganizationInviteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [toast, setToast] = useState<{ msg: string; severity: "success" | "error" } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const inv = await getMyOrgInvite();
      if (!cancelled) {
        setInvite(inv);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fullUrl =
    invite && typeof window !== "undefined"
      ? `${window.location.origin}${invite.join_path}`
      : invite?.join_path ?? "";

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ msg: `Copied ${label}.`, severity: "success" });
    } catch {
      setToast({ msg: "Couldn't copy. Select manually.", severity: "error" });
    }
  };

  const doRotate = async () => {
    setRotating(true);
    const { data, error } = await rotateMyOrgInvite();
    setRotating(false);
    if (error || !data) {
      setToast({ msg: error ?? "Failed to rotate invite.", severity: "error" });
      return;
    }
    setInvite(data);
    setConfirmRotate(false);
    setToast({ msg: "Invite rotated. The old link is now invalid.", severity: "success" });
  };

  return (
    <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <LinkIcon sx={{ color: "#0ea5e9" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Invite link
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Share this link with people you want to invite. It can be reused as many
              times as you like. Rotate to invalidate the old link.
            </Typography>
          </Box>
          <Tooltip title="Generate a new code and invalidate the old one">
            <span>
              <Button
                variant="outlined"
                startIcon={<AutorenewIcon />}
                onClick={() => setConfirmRotate(true)}
                disabled={loading || !invite}
              >
                Rotate
              </Button>
            </span>
          </Tooltip>
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : !invite ? (
          <Alert severity="error">Could not load the invite link.</Alert>
        ) : (
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
                Link
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  value={fullUrl}
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true, sx: { fontFamily: "monospace" } }}
                />
                <Button
                  startIcon={<ContentCopyIcon fontSize="small" />}
                  onClick={() => copy(fullUrl, "link")}
                >
                  Copy
                </Button>
              </Stack>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
                Code
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={invite.code}
                  sx={{ fontFamily: "monospace", fontSize: "0.95rem" }}
                />
                <Button
                  size="small"
                  startIcon={<ContentCopyIcon fontSize="small" />}
                  onClick={() => copy(invite.code, "code")}
                >
                  Copy code
                </Button>
              </Stack>
            </Box>
          </Stack>
        )}
      </CardContent>

      <Dialog
        open={confirmRotate}
        onClose={rotating ? undefined : () => setConfirmRotate(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Rotate invite link?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The current link will stop working immediately. Anyone who already
            joined keeps their membership.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRotate(false)} disabled={rotating}>
            Cancel
          </Button>
          <Button
            onClick={doRotate}
            variant="contained"
            color="warning"
            disabled={rotating}
            startIcon={rotating ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {rotating ? "Rotating…" : "Rotate"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} sx={{ width: "100%" }}>
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Card>
  );
};

export default MyOrgInvite;
