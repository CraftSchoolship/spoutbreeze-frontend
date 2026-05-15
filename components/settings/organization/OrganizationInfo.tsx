"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import VerifiedIcon from "@mui/icons-material/Verified";
import NextLink from "next/link";

import { fetchMyOrganization } from "@/actions/fetchMyOrganization";
import {
  fetchCurrentUser,
  getPrimaryRole,
  hasRole,
  User,
} from "@/actions/fetchUsers";
import type { Organization } from "@/actions/fetchOrganizations";

const OrganizationInfo: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [u, o] = await Promise.all([fetchCurrentUser(), fetchMyOrganization()]);
      if (!cancelled) {
        setUser(u);
        setOrg(o);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const emailDomain = user?.email?.split("@")[1]?.toLowerCase();
  const matchingDomain =
    emailDomain && org?.email_domains?.includes(emailDomain) ? emailDomain : null;
  const isOrgAdmin = user ? hasRole(user, "admin") : false;

  return (
    <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Organization
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          The organization your account belongs to.
        </Typography>
      </Box>

      {!org ? (
        <Alert severity="info" icon={<ApartmentIcon />}>
          You are not assigned to an organization. A platform administrator can
          assign you, or your account will be auto-assigned the next time you
          sign in with an email address whose domain is registered to an
          organization.
        </Alert>
      ) : (
        <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none" }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <ApartmentIcon sx={{ color: "#0ea5e9" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {org.name}
                </Typography>
                <Chip
                  label={org.is_active ? "Active" : "Inactive"}
                  size="small"
                  color={org.is_active ? "success" : "default"}
                  variant="outlined"
                />
              </Stack>

              <Divider />

              <Box>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
                  Your role
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user ? getPrimaryRole(user) : "—"}
                  {isOrgAdmin && (
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ ml: 1, color: "#64748b", fontWeight: 400 }}
                    >
                      — manage members at{" "}
                      <MuiLink component={NextLink} href="/my-org" underline="hover">
                        My Organization
                      </MuiLink>
                    </Typography>
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
                  Registered email domains
                </Typography>
                {org.email_domains.length === 0 ? (
                  <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic" }}>
                    No email domains registered. New signups must be assigned by
                    a platform admin.
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {org.email_domains.map((d) => (
                      <Chip
                        key={d}
                        label={d}
                        size="small"
                        variant="outlined"
                        icon={d === matchingDomain ? <VerifiedIcon /> : undefined}
                        color={d === matchingDomain ? "success" : "default"}
                      />
                    ))}
                  </Stack>
                )}
                {matchingDomain && (
                  <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 1 }}>
                    Your email matches <strong>{matchingDomain}</strong> — that&apos;s how you were
                    placed in this organization.
                  </Typography>
                )}
              </Box>

              <Divider />

              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                Organization membership is managed by platform administrators.
                Contact support if your assignment looks wrong.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};

export default OrganizationInfo;
