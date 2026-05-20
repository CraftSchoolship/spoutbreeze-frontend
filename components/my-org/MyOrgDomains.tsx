"use client";

import React, { useState } from "react";
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
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import {
  addMyOrgDomain,
  deleteMyOrgDomain,
  verifyMyOrgDomainByName,
} from "@/actions/fetchMyOrganization";
import type {
  EmailDomainDetail,
  Organization,
} from "@/actions/fetchOrganizations";

interface MyOrgDomainsProps {
  org: Organization;
  onChanged: () => void;
}

const MyOrgDomains: React.FC<MyOrgDomainsProps> = ({ org, onChanged }) => {
  const [addOpen, setAddOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [detailDialog, setDetailDialog] = useState<EmailDomainDetail | null>(null);
  const [toDelete, setToDelete] = useState<EmailDomainDetail | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; severity: "success" | "error" | "info" } | null>(null);

  const formatDate = (iso: string | null): string =>
    iso ? new Date(iso).toLocaleString() : "—";

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ msg: `Copied ${label}.`, severity: "success" });
    } catch {
      setToast({ msg: "Couldn't copy. Select manually.", severity: "error" });
    }
  };

  const handleAdd = async () => {
    setAdding(true);
    const { data, error } = await addMyOrgDomain(newDomain.trim());
    setAdding(false);
    if (error || !data) {
      setToast({ msg: error ?? "Failed to add domain.", severity: "error" });
      return;
    }
    setAddOpen(false);
    setNewDomain("");
    // Open the details modal immediately so the user sees the TXT record they
    // need to publish before they have to hunt for it.
    setDetailDialog({
      domain: data.domain,
      verified: data.verified,
      verified_at: null,
      verification_record_name: data.verification_record_name,
      verification_record_value: data.verification_record_value,
    });
    setToast({ msg: `Domain added. Publish the TXT record, then click Check now.`, severity: "success" });
    onChanged();
  };

  const handleVerify = async (domain: string) => {
    setVerifyingDomain(domain);
    const { data, error } = await verifyMyOrgDomainByName(domain);
    setVerifyingDomain(null);
    if (error || !data) {
      setToast({ msg: error ?? "Verification failed.", severity: "error" });
      return;
    }
    if (data.verified) {
      setToast({ msg: `${domain} is now verified.`, severity: "success" });
      setDetailDialog(null);
      onChanged();
    } else {
      setToast({
        msg: `No matching TXT record yet for ${domain}. DNS can take a few minutes.`,
        severity: "info",
      });
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const { success, error } = await deleteMyOrgDomain(toDelete.domain);
    setDeleting(false);
    if (success) {
      setToast({ msg: `Removed ${toDelete.domain}.`, severity: "success" });
      setToDelete(null);
      onChanged();
    } else {
      setToast({ msg: error ?? "Failed to delete domain.", severity: "error" });
    }
  };

  return (
    <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Domains
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Email domains registered to your organization. Verified domains
            auto-attach new signups whose email matches the domain.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
          sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}
        >
          Add domain
        </Button>
      </Stack>

      <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
        <CardContent>
          {org.email_domain_details.length === 0 ? (
            <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic", py: 2 }}>
              No domains registered yet. Add one to enable auto-match for new signups.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Domain</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {org.email_domain_details.map((d) => (
                    <TableRow key={d.domain} hover>
                      <TableCell sx={{ fontFamily: "monospace" }}>{d.domain}</TableCell>
                      <TableCell>
                        {d.verified ? (
                          <Chip
                            label="Verified"
                            size="small"
                            color="success"
                            icon={<CheckCircleIcon />}
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            label="Pending verification"
                            size="small"
                            color="warning"
                            icon={<HourglassEmptyIcon />}
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View domain details">
                          <IconButton size="small" onClick={() => setDetailDialog(d)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {!d.verified && (
                          <Tooltip title="Check DNS now">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleVerify(d.domain)}
                                disabled={verifyingDomain === d.domain}
                              >
                                {verifyingDomain === d.domain ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <RefreshIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                        <Tooltip title="Remove this domain">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setToDelete(d)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add domain dialog */}
      <Dialog
        open={addOpen}
        onClose={adding ? undefined : () => setAddOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add a new domain</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            Add another email domain to this organization. You&apos;ll get a DNS
            TXT record to publish; once verified, new signups with that
            domain auto-join your org.
          </Typography>
          <TextField
            label="Email domain"
            placeholder="example.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            fullWidth
            autoFocus
            disabled={adding}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} disabled={adding}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={adding || !newDomain.trim()}
            startIcon={adding ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {adding ? "Adding…" : "Add domain"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Domain details dialog (works for both verified and pending) */}
      <Dialog
        open={Boolean(detailDialog)}
        onClose={() => setDetailDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <span style={{ fontFamily: "monospace" }}>{detailDialog?.domain}</span>
        </DialogTitle>
        <DialogContent>
          {detailDialog && (
            <>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                {detailDialog.verified ? (
                  <Chip
                    label="Verified"
                    size="small"
                    color="success"
                    icon={<CheckCircleIcon />}
                    variant="outlined"
                  />
                ) : (
                  <Chip
                    label="Pending verification"
                    size="small"
                    color="warning"
                    icon={<HourglassEmptyIcon />}
                    variant="outlined"
                  />
                )}
                {detailDialog.verified && detailDialog.verified_at && (
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Verified {formatDate(detailDialog.verified_at)}
                  </Typography>
                )}
              </Stack>

              {detailDialog.verified ? (
                <Alert severity="success">
                  This domain is verified. The verification TXT record at{" "}
                  <code>_bluescale-verify.{detailDialog.domain}</code> is no
                  longer required and can be removed from your DNS at any
                  time — verification is one-time. New signups whose email
                  domain matches will auto-join this organization.
                </Alert>
              ) : (
                <>
                  <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
                    Add this TXT record at your domain&apos;s DNS provider, then
                    click <strong>Check now</strong>.
                  </Typography>
                  <Stack spacing={1}>
                    <DnsRow label="Type" value="TXT" />
                    <DnsRow
                      label="Name"
                      value={detailDialog.verification_record_name ?? ""}
                      onCopy={(v) => copy(v, "name")}
                    />
                    <DnsRow
                      label="Value"
                      value={detailDialog.verification_record_value ?? ""}
                      onCopy={(v) => copy(v, "value")}
                    />
                  </Stack>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Some DNS providers (OVH, Route 53) want only the prefix
                    in the Name field (e.g. <code>_bluescale-verify</code>) —
                    they auto-append the parent domain. Others (Cloudflare)
                    want the full name. If you&apos;re unsure, save the record
                    then run{" "}
                    <code>
                      dig TXT {detailDialog.verification_record_name} @8.8.8.8
                    </code>{" "}
                    to confirm.
                  </Alert>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(null)}>Close</Button>
          {detailDialog && !detailDialog.verified && (
            <Button
              variant="contained"
              startIcon={
                verifyingDomain === detailDialog.domain ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <RefreshIcon />
                )
              }
              onClick={() => handleVerify(detailDialog.domain)}
              disabled={verifyingDomain === detailDialog.domain}
            >
              {verifyingDomain === detailDialog.domain ? "Checking…" : "Check now"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={Boolean(toDelete)}
        onClose={deleting ? undefined : () => setToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Remove domain?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Remove <strong style={{ fontFamily: "monospace" }}>{toDelete?.domain}</strong>{" "}
            from this organization?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            New signups with this email domain will no longer auto-join your
            org. Existing members keep their membership. Other organizations
            will be free to claim this domain.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {deleting ? "Removing…" : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} sx={{ width: "100%" }}>
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Stack>
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
      bgcolor: "#f8fafc",
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

export default MyOrgDomains;
