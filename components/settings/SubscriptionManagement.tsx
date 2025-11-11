"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  getSubscription,
  createCustomerPortal,
  Subscription,
  getPlanLimits,
  PlanLimits,
} from "@/actions/subscription";
import { useRouter } from "next/navigation";

export default function SubscriptionManagement() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managingSubscription, setManagingSubscription] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subData, limitsData] = await Promise.all([
        getSubscription(),
        getPlanLimits(),
      ]);
      setSubscription(subData);
      setLimits(limitsData);
    } catch (err) {
      setError(err.message || "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setManagingSubscription(true);
      const returnUrl = `${window.location.origin}/settings/subscription`;
      const portal = await createCustomerPortal(returnUrl);

      if (portal && portal.url) {
        window.location.href = portal.url;
      }
    } catch (err) {
      setError(err.message || "Failed to open subscription management");
      setManagingSubscription(false);
    }
  };

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "trialing":
        return "info";
      case "canceled":
        return "error";
      case "past_due":
        return "warning";
      default:
        return "default";
    }
  };

  const getPlanName = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!subscription) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No subscription found. Please select a plan to get started.
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpgrade}
          sx={{ mt: 2 }}
        >
          View Plans
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Subscription Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        {/* Current Plan Card */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Plan
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {getPlanName(subscription.plan)}
                </Typography>
                <Chip
                  label={subscription.status.toUpperCase()}
                  color={getStatusColor(subscription.status) }
                  size="small"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <List dense>
                {subscription.trial_end && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Trial Ends"
                      secondary={formatDate(subscription.trial_end)}
                    />
                  </ListItem>
                )}
                {subscription.current_period_end && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        subscription.cancel_at_period_end
                          ? "Cancels On"
                          : "Renews On"
                      }
                      secondary={formatDate(subscription.current_period_end)}
                    />
                  </ListItem>
                )}
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Member Since"
                    secondary={formatDate(subscription.created_at)}
                  />
                </ListItem>
              </List>

              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                {subscription.plan === "free" ? (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleUpgrade}
                  >
                    Upgrade Plan
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleManageSubscription}
                      disabled={managingSubscription}
                    >
                      {managingSubscription ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Manage Subscription"
                      )}
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleUpgrade}
                    >
                      Change Plan
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Plan Limits Card */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Plan Features & Limits
              </Typography>

              {limits && (
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Max Video Quality"
                      secondary={limits.max_quality}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Concurrent Streams"
                      secondary={
                        limits.max_concurrent_streams === null
                          ? "Unlimited"
                          : limits.max_concurrent_streams
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Stream Duration"
                      secondary={
                        limits.max_stream_duration_hours === null
                          ? "Unlimited"
                          : `${limits.max_stream_duration_hours} hour(s)`
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Support Response"
                      secondary={
                        limits.support_response_hours === 0
                          ? "24/7"
                          : `${limits.support_response_hours} hours`
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Support Channels"
                      secondary={limits.support_channels.join(", ")}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Chat Content Filter"
                      secondary={limits.chat_filter ? "Enabled" : "Not Available"}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="OAuth Integration"
                      secondary={limits.oauth_enabled ? "Enabled" : "Not Available"}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Analytics"
                      secondary={limits.analytics_enabled ? "Enabled" : "Not Available"}
                    />
                  </ListItem>
                </List>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Billing Information */}
      {subscription.plan !== "free" && (
        <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Billing Information
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  To update your billing information, payment method, or view
                  invoices, click the &quot;Manage Subscription&quot; button above. You&apos;ll
                  be redirected to our secure billing portal powered by Stripe.
                </Typography>
              </CardContent>
            </Card>
        </Box>
      )}
    </Box>
  );
}
