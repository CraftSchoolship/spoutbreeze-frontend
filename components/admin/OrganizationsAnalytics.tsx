"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  Grid,
  IconButton,
  Snackbar,
  Stack,
  Switch,
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
import ApartmentIcon from "@mui/icons-material/Apartment";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GroupIcon from "@mui/icons-material/Group";
import PaidIcon from "@mui/icons-material/Paid";

import KpiCard from "./KpiCard";
import type { OrganizationStats } from "@/actions/fetchAdminAnalytics";
import {
  Organization,
  createOrganization,
  deleteOrganization,
  fetchOrganizations,
  updateOrganization,
} from "@/actions/fetchOrganizations";

interface OrganizationsAnalyticsProps {
  stats: OrganizationStats[];
}

interface FormState {
  open: boolean;
  mode: "create" | "edit";
  id?: string;
  name: string;
  domainsText: string;
  isActive: boolean;
  saving: boolean;
  error: string | null;
}

const emptyForm: FormState = {
  open: false,
  mode: "create",
  name: "",
  domainsText: "",
  isActive: true,
  saving: false,
  error: null,
};

const parseDomains = (text: string): string[] =>
  text
    .split(/[\s,;]+/)
    .map((d) => d.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);

const formatCurrency = (n: number): string =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const OrganizationsAnalytics: React.FC<OrganizationsAnalyticsProps> = ({ stats }) => {
  const [orgs, setOrgs] = useState<Organization[] | null>(null);
  const [orgsError, setOrgsError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [toDelete, setToDelete] = useState<Organization | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; severity: "success" | "error" } | null>(null);

  const reloadOrgs = async () => {
    const all = await fetchOrganizations();
    setOrgs(all);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await fetchOrganizations();
        if (!cancelled) setOrgs(all);
      } catch {
        if (!cancelled) setOrgsError("Failed to load organizations.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const orgsById = useMemo(() => {
    const map = new Map<string, Organization>();
    (orgs ?? []).forEach((o) => map.set(o.id, o));
    return map;
  }, [orgs]);

  const realOrgRowCount = stats.filter((s) => s.id !== null).length;
  const totalUsers = stats.reduce((acc, s) => acc + s.user_count, 0);
  const totalRevenue = stats.reduce((acc, s) => acc + s.revenue_30d_usd, 0);

  const openCreate = () => setForm({ ...emptyForm, open: true, mode: "create" });
  const openEdit = (org: Organization) =>
    setForm({
      open: true,
      mode: "edit",
      id: org.id,
      name: org.name,
      domainsText: org.email_domains.join(", "),
      isActive: org.is_active,
      saving: false,
      error: null,
    });
  const closeForm = () => setForm(emptyForm);

  const submitForm = async () => {
    setForm((f) => ({ ...f, saving: true, error: null }));
    const domains = parseDomains(form.domainsText);
    if (form.mode === "create") {
      const { org, error } = await createOrganization({
        name: form.name.trim(),
        email_domains: domains,
      });
      if (error || !org) {
        setForm((f) => ({ ...f, saving: false, error: error ?? "Unknown error" }));
        return;
      }
      setToast({ msg: `Created ${org.name}.`, severity: "success" });
    } else if (form.id) {
      const { org, error } = await updateOrganization(form.id, {
        name: form.name.trim(),
        email_domains: domains,
        is_active: form.isActive,
      });
      if (error || !org) {
        setForm((f) => ({ ...f, saving: false, error: error ?? "Unknown error" }));
        return;
      }
      setToast({ msg: `Updated ${org.name}.`, severity: "success" });
    }
    setForm(emptyForm);
    await reloadOrgs();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const { success, error } = await deleteOrganization(toDelete.id);
    setDeleting(false);
    if (success) {
      setToast({ msg: `Deleted ${toDelete.name}.`, severity: "success" });
      setToDelete(null);
      await reloadOrgs();
    } else {
      setToast({ msg: error ?? "Failed to delete organization.", severity: "error" });
    }
  };

  return (
    <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Organizations
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Per-organization breakdown of users, events, streams, and revenue.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Organizations"
            value={realOrgRowCount}
            icon={<ApartmentIcon />}
            accent="blue"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Total users (rolled up)"
            value={totalUsers}
            icon={<GroupIcon />}
            accent="green"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Revenue (30d)"
            value={formatCurrency(totalRevenue)}
            icon={<PaidIcon />}
            accent="amber"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Unassigned bucket"
            value={stats.find((s) => s.id === null)?.user_count ?? 0}
            hint="users with no org"
            accent="slate"
          />
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Rollup by organization
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Organization</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Users
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Active
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Events
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    BBB
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Streams (30d)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Active subs
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Revenue (30d)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.map((row) => {
                  const isUnassigned = row.id === null;
                  const inactive = !isUnassigned && row.id && orgsById.get(row.id)?.is_active === false;
                  return (
                    <TableRow key={row.id ?? "unassigned"} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: isUnassigned ? 400 : 600,
                              color: isUnassigned ? "#94a3b8" : "#0f172a",
                              fontStyle: isUnassigned ? "italic" : "normal",
                            }}
                          >
                            {row.name}
                          </Typography>
                          {inactive && (
                            <Chip label="Inactive" size="small" variant="outlined" />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{row.user_count}</TableCell>
                      <TableCell align="right">{row.active_users}</TableCell>
                      <TableCell align="right">{row.events_total}</TableCell>
                      <TableCell align="right">{row.bbb_meetings_total}</TableCell>
                      <TableCell align="right">{row.streams_30d}</TableCell>
                      <TableCell align="right">{row.active_subscriptions}</TableCell>
                      <TableCell align="right">{formatCurrency(row.revenue_30d_usd)}</TableCell>
                    </TableRow>
                  );
                })}
                {stats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        No organizations yet. Create one below.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

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
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Manage organizations
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Create, edit, and remove organizations and their email domains.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
              sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}
            >
              New organization
            </Button>
          </Stack>

          {orgsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {orgsError}
            </Alert>
          )}

          {!orgs && !orgsError ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email domains</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(orgs ?? []).map((org) => (
                    <TableRow key={org.id} hover>
                      <TableCell>{org.name}</TableCell>
                      <TableCell>
                        {org.email_domains.length === 0 ? (
                          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                            —
                          </Typography>
                        ) : (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            {org.email_domains.map((d) => (
                              <Chip key={d} label={d} size="small" variant="outlined" />
                            ))}
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={org.is_active ? "Active" : "Inactive"}
                          size="small"
                          color={org.is_active ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit organization">
                          <IconButton size="small" onClick={() => openEdit(org)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete organization">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setToDelete(org)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(orgs ?? []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                          No organizations yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={form.open} onClose={form.saving ? undefined : closeForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {form.mode === "create" ? "New organization" : "Edit organization"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              fullWidth
              required
              autoFocus
              disabled={form.saving}
            />
            <TextField
              label="Email domains"
              value={form.domainsText}
              onChange={(e) => setForm((f) => ({ ...f, domainsText: e.target.value }))}
              placeholder="harvard.edu, mit.edu"
              helperText="Comma-, space-, or newline-separated. Users signing up with a matching email domain are auto-assigned on first login."
              fullWidth
              multiline
              minRows={2}
              disabled={form.saving}
            />
            {form.mode === "edit" && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2">Active</Typography>
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  disabled={form.saving}
                />
              </Stack>
            )}
            {form.error && <Alert severity="error">{form.error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm} disabled={form.saving}>
            Cancel
          </Button>
          <Button
            onClick={submitForm}
            variant="contained"
            disabled={form.saving || !form.name.trim()}
            startIcon={form.saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {form.saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(toDelete)}
        onClose={deleting ? undefined : () => setToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete organization?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete <strong>{toDelete?.name}</strong> and unassign any users
            currently linked to it (they will fall back to Unassigned). This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {deleting ? "Deleting…" : "Delete"}
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
          <Alert
            severity={toast.severity}
            onClose={() => setToast(null)}
            sx={{ width: "100%" }}
          >
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Stack>
  );
};

export default OrganizationsAnalytics;
