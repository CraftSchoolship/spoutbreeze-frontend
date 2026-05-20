"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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

import { fetchMyOrgUsers, updateMyOrgUserRole } from "@/actions/fetchMyOrganization";
import { getUserRoles, User } from "@/actions/fetchUsers";

interface MyOrgMembersProps {
  currentUser: User;
}

const formatDate = (iso: string) => new Date(iso).toLocaleString();

type AssignableRole = "moderator" | "admin";

const MyOrgMembers: React.FC<MyOrgMembersProps> = ({ currentUser }) => {
  const [members, setMembers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [updatingFor, setUpdatingFor] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; severity: "success" | "error" } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await fetchMyOrgUsers();
        if (!cancelled) setMembers(all);
      } catch {
        if (!cancelled) setError("Failed to load members.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!members) return [];
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.roles ?? "").toLowerCase().includes(q)
    );
  }, [members, search]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const primaryAssignableRole = (u: User): AssignableRole => {
    const roles = getUserRoles(u);
    return roles.includes("admin") ? "admin" : "moderator";
  };

  const canChangeRole = (u: User): boolean => {
    if (u.id === currentUser.id) return false;
    if (getUserRoles(u).includes("super_admin")) return false;
    return true;
  };

  const handleRoleChange = async (u: User, next: AssignableRole) => {
    if (primaryAssignableRole(u) === next) return;
    setUpdatingFor(u.id);
    const { success, error: err } = await updateMyOrgUserRole(u.id, next);
    setUpdatingFor(null);
    if (success) {
      setMembers((prev) =>
        prev ? prev.map((m) => (m.id === u.id ? { ...m, roles: next } : m)) : prev
      );
      setToast({ msg: `Set ${u.username} to ${next}.`, severity: "success" });
    } else {
      setToast({ msg: err ?? "Failed to update role.", severity: "error" });
    }
  };

  return (
    <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Members
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Everyone in your organization. You can promote a moderator to admin
          or demote an admin back to moderator. You cannot change your own
          role, remove members from the organization, or touch platform admins.
        </Typography>
      </Box>

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
                Members list
              </Typography>
              {members && (
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  {filtered.length} of {members.length}
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

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!members && !error ? (
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
                      <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginated.map((u) => {
                      const isSelf = u.id === currentUser.id;
                      const isSuper = getUserRoles(u).includes("super_admin");
                      const editable = canChangeRole(u);
                      const tooltip = isSelf
                        ? "You cannot change your own role"
                        : isSuper
                          ? "Platform admins are managed by the platform owner"
                          : "Change member role";
                      return (
                        <TableRow key={u.id} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <span>{u.username}</span>
                              {isSelf && (
                                <Chip label="You" size="small" variant="outlined" />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell sx={{ minWidth: 180 }}>
                            {isSuper ? (
                              <Chip label="Super admin" size="small" color="warning" variant="outlined" />
                            ) : (
                              <Tooltip title={tooltip}>
                                <span>
                                  <Select
                                    size="small"
                                    value={primaryAssignableRole(u)}
                                    onChange={(e) =>
                                      handleRoleChange(u, e.target.value as AssignableRole)
                                    }
                                    disabled={!editable || updatingFor === u.id}
                                    sx={{ minWidth: 140, fontSize: "0.85rem" }}
                                  >
                                    <MenuItem value="moderator">Moderator</MenuItem>
                                    <MenuItem value="admin">Org admin</MenuItem>
                                  </Select>
                                </span>
                              </Tooltip>
                            )}
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
                        </TableRow>
                      );
                    })}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                            {members && members.length === 0
                              ? "No members in your organization yet."
                              : "No members match the search."}
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

export default MyOrgMembers;
