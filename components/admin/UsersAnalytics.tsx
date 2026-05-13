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
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GroupIcon from "@mui/icons-material/Group";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import HowToRegIcon from "@mui/icons-material/HowToReg";

import KpiCard from "./KpiCard";
import type { UsersStats } from "@/actions/fetchAdminAnalytics";
import { deleteUser, fetchUsers, getUserRoles, User } from "@/actions/fetchUsers";
import {
  Organization,
  assignUserOrganization,
  fetchOrganizations,
} from "@/actions/fetchOrganizations";

const formatDate = (iso: string) => new Date(iso).toLocaleString();

interface UsersAnalyticsProps {
  stats: UsersStats;
  currentUser: User | null;
}

const UsersAnalytics: React.FC<UsersAnalyticsProps> = ({ stats, currentUser }) => {
  const adminCount = stats.by_role["admin"] ?? 0;

  const [users, setUsers] = useState<User[] | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [orgUpdatingFor, setOrgUpdatingFor] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; severity: "success" | "error" } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [allUsers, allOrgs] = await Promise.all([
          fetchUsers({ skip: 0, limit: 1000 }),
          fetchOrganizations(),
        ]);
        if (!cancelled) {
          setUsers(allUsers);
          setOrgs(allOrgs);
        }
      } catch {
        if (!cancelled) setUsersError("Failed to load users.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const orgsById = useMemo(() => {
    const map = new Map<string, Organization>();
    orgs.forEach((o) => map.set(o.id, o));
    return map;
  }, [orgs]);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const orgName = u.organization_id ? orgsById.get(u.organization_id)?.name ?? "" : "";
      return (
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.roles ?? "").toLowerCase().includes(q) ||
        orgName.toLowerCase().includes(q)
      );
    });
  }, [users, search, orgsById]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const canDelete = (u: User): boolean => {
    if (!currentUser) return false;
    if (u.id === currentUser.id) return false;
    if (getUserRoles(u).includes("super_admin")) return false;
    return true;
  };

  const handleOrgChange = async (user: User, newOrgId: string | null) => {
    if ((user.organization_id ?? null) === newOrgId) return;
    setOrgUpdatingFor(user.id);
    const { success, error } = await assignUserOrganization(user.id, newOrgId);
    setOrgUpdatingFor(null);
    if (success) {
      setUsers((prev) =>
        prev
          ? prev.map((u) => (u.id === user.id ? { ...u, organization_id: newOrgId } : u))
          : prev
      );
      const orgName = newOrgId ? orgsById.get(newOrgId)?.name ?? "organization" : "Unassigned";
      setToast({ msg: `Set ${user.username} to ${orgName}.`, severity: "success" });
    } else {
      setToast({ msg: error ?? "Failed to update organization.", severity: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const result = await deleteUser(toDelete.id);
    setDeleting(false);
    if (result.success) {
      setUsers((prev) => (prev ? prev.filter((u) => u.id !== toDelete.id) : prev));
      setToast({ msg: `Deleted ${toDelete.username}.`, severity: "success" });
      setToDelete(null);
    } else {
      setToast({ msg: result.error ?? "Failed to delete user.", severity: "error" });
    }
  };

  return (
    <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Users & Growth
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Account totals, growth, and role distribution.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard label="Total users" value={stats.total} icon={<GroupIcon />} accent="blue" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Active"
            value={stats.active}
            hint={`${stats.inactive} inactive`}
            icon={<HowToRegIcon />}
            accent="green"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="New (7d)"
            value={stats.new_7d}
            hint={`${stats.new_30d} in 30d`}
            icon={<PersonAddIcon />}
            accent="amber"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            label="Admins"
            value={adminCount}
            icon={<AdminPanelSettingsIcon />}
            accent="slate"
          />
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Roles distribution
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(stats.by_role).map(([role, count]) => (
              <Chip
                key={role}
                label={`${role}: ${count}`}
                size="small"
                variant="outlined"
                sx={{ borderColor: "#cbd5e1", color: "#334155" }}
              />
            ))}
            {Object.keys(stats.by_role).length === 0 && (
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                No roles recorded yet.
              </Typography>
            )}
          </Stack>
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
                All users
              </Typography>
              {users && (
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  {filtered.length} of {users.length}
                </Typography>
              )}
            </Box>
            <TextField
              size="small"
              placeholder="Search by username, email, role"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: { sm: 320 } }}
            />
          </Stack>

          {usersError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {usersError}
            </Alert>
          )}

          {!users && !usersError ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Roles</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Organization</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginated.map((u) => {
                      const deletable = canDelete(u);
                      const tooltip =
                        currentUser && u.id === currentUser.id
                          ? "You cannot delete yourself here"
                          : getUserRoles(u).includes("super_admin")
                            ? "Super admins cannot be deleted"
                            : "Delete user";
                      return (
                        <TableRow key={u.id} hover>
                          <TableCell>{u.username}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: "#475569" }}>
                              {u.roles || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: 200 }}>
                            <Select
                              size="small"
                              value={u.organization_id ?? ""}
                              onChange={(e) =>
                                handleOrgChange(u, e.target.value === "" ? null : (e.target.value as string))
                              }
                              disabled={orgUpdatingFor === u.id}
                              displayEmpty
                              sx={{ minWidth: 180, fontSize: "0.85rem" }}
                              renderValue={(val) => {
                                if (!val) {
                                  return (
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#94a3b8", fontStyle: "italic" }}
                                    >
                                      Unassigned
                                    </Typography>
                                  );
                                }
                                return orgsById.get(val as string)?.name ?? "(deleted)";
                              }}
                            >
                              <MenuItem value="">
                                <em>Unassigned</em>
                              </MenuItem>
                              {orgs.map((o) => (
                                <MenuItem key={o.id} value={o.id}>
                                  {o.name}
                                  {!o.is_active ? " (inactive)" : ""}
                                </MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={u.is_active ? "Active" : "Inactive"}
                              size="small"
                              color={u.is_active ? "success" : "default"}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{formatDate(u.created_at)}</TableCell>
                          <TableCell align="right">
                            <Tooltip title={tooltip}>
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled={!deletable}
                                  onClick={() => setToDelete(u)}
                                  aria-label={`Delete ${u.username}`}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                            {users && users.length === 0
                              ? "No users yet."
                              : "No users match the search."}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(toDelete)}
        onClose={() => (deleting ? null : setToDelete(null))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete user?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete <strong>{toDelete?.username}</strong> ({toDelete?.email})
            from Keycloak and the database, cancel any active subscription, and remove all related
            data. This cannot be undone.
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

export default UsersAnalytics;
