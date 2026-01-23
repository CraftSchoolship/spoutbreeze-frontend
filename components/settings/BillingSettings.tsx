"use client";
import React, { useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import BusinessIcon from "@mui/icons-material/Business";
import {
  getSubscription,
  getPlans,
  createCheckoutSession,
  createCustomerPortal,
  Subscription,
  PlanInfo,
} from "@/actions/subscription";

export default function BillingSettings() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [contactDialog, setContactDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subData, plansData] = await Promise.all([
        getSubscription(),
        getPlans(),
      ]);
      setSubscription(subData);
      setPlans(plansData);
      
      // Check if plans are properly configured
      if (plansData.length === 0) {
        setError("No subscription plans configured. Please check Stripe configuration.");
      }
    } catch (err: any) {
      console.error("Failed to load subscription data:", err);
      if (err?.response?.status === 500) {
        setError("Payment system is not configured yet. Please contact support or check the setup guide.");
      } else {
        setError(err?.message || "Failed to load subscription data");
      }
    } finally {
      setLoading(false);
    }
  };


  const showSnackbar = (message: string) => setSnackbar({ open: true, message });

  const handleSubscribe = async (plan: PlanInfo) => {
    if (plan.plan_type === "free") return;
    if (plan.plan_type === "enterprise") {
      setContactDialog(true);
      return;
    }
    try {
      setProcessingPlan(plan.plan_type);
      const successUrl = `${window.location.origin}/settings?tab=subscription&success=true`;
      const cancelUrl = `${window.location.origin}/settings?tab=subscription&canceled=true`;
      const session = await createCheckoutSession(plan.stripe_price_id, successUrl, cancelUrl);
      if (session?.url) window.location.href = session.url;
    } catch (err: any) {
      showSnackbar(err?.message || "Failed to start checkout");
      setProcessingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const returnUrl = `${window.location.origin}/settings?tab=subscription`;
      const portal = await createCustomerPortal(returnUrl);

      if (portal && portal.url) {
        window.location.href = portal.url;
      }
    } catch (err: any) {
      setError(err?.message || "Failed to open subscription management");
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case "free":
        return <StarIcon sx={{ fontSize: 40 }} />;
      case "pro":
        return <RocketLaunchIcon sx={{ fontSize: 40 }} />;
      case "enterprise":
        return <BusinessIcon sx={{ fontSize: 40 }} />;
      default:
        return null;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case "free": // Basic plan
        return "#64748b";
      case "pro":
        return "#3b82f6";
      case "enterprise":
        return "#8b5cf6";
      default:
        return "#64748b";
    }
  };

  const isCurrentPlan = (planType: string) => {
    return subscription?.plan === planType;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state (consolidated)
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress thickness={5} size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, px: isSmall ? 2 : 6, maxWidth: 1000, mx: "auto" }}>
      {/* Header Section */}
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Manage Your Subscription
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="600" gutterBottom>
            ⚠️ Payment System Configuration Required
          </Typography>
          <Typography variant="body2" paragraph>
            {error}
          </Typography>
          <Typography variant="body2" component="div">
            <strong>Setup Steps:</strong>
            <ol style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
              <li>Go to <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" style={{ color: "#667eea", textDecoration: "underline" }}>Stripe Dashboard</a></li>
              <li>Create products: Free, Pro ($69/month), and Enterprise</li>
              <li>Copy the <strong>Price IDs</strong> (starting with <code>price_</code>, NOT <code>prod_</code>)</li>
              <li>Update backend <code>.env</code> file with the correct price IDs</li>
              <li>Restart the backend server</li>
            </ol>
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, display: "block", opacity: 0.8 }}>
            📚 See <code>STRIPE_SETUP_GUIDE.md</code> for detailed instructions
          </Typography>
        </Alert>
      )}

      {/* Current Subscription Card */}
      {subscription && (
        <Card
          sx={{
            mb: 4,
            background: "linear-gradient(133deg, #525cfa 0%, #dd76ec 100%)",
            color: "white",
            borderRadius: 4,
            boxShadow: "0 4px 24px 0 rgba(50,50,100,0.12)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <CardContent sx={{ position: "relative", zIndex: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.95, letterSpacing: 1.5 }}>
                  Current Plan
                </Typography>
                <Typography variant="h3" fontWeight={800} sx={{ mb: 1.5, mt: 0.5 }}>
                  {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                </Typography>
                <Chip
                  label={subscription.status.toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.25)",
                    backdropFilter: "blur(10px)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: 1,
                  }}
                />
              </Box>
              {subscription.plan !== "free" && (
                <Button
                  variant="contained"
                  onClick={handleManageSubscription}
                  sx={{
                    bgcolor: "white",
                    color: "#525cfa",
                    fontWeight: 700,
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.95)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Manage Billing
                </Button>
              )}
            </Stack>

            <Divider sx={{ my: 3, borderColor: "rgba(255, 255, 255, 0.25)" }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={4}>
              {subscription.trial_end && (
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.7rem" }}>
                    Trial Ends
                  </Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                    {formatDate(subscription.trial_end)}
                  </Typography>
                </Box>
              )}
              {subscription.current_period_end && (
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.7rem" }}>
                    {subscription.cancel_at_period_end ? "Cancels On" : "Renews On"}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                    {formatDate(subscription.current_period_end)}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Plan Cards Grid */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2, mt: 6, textAlign: "center" }}>
        Compare Plans
      </Typography>
  <Stack direction={{ xs: "column", md: "row" }} spacing={4} sx={{ mb: 4, mt: 3 }} justifyContent="center" alignItems={{ xs: "stretch", md: "stretch" }}>
        {plans.map((plan) => {
          const isCurrent = isCurrentPlan(plan.plan_type);
          const color = getPlanColor(plan.plan_type);

          return (
            <Card
              key={plan.plan_type}
              variant="outlined"
              sx={{
                border: isCurrent ? `3px solid ${color}` : "1px solid #e0e0e0",
                borderRadius: 4,
                boxShadow: plan.is_popular ? "0 6px 30px 0 #aabbff25" : "0 2px 8px 0 #d6d9ed10",
                transform: plan.is_popular ? "scale(1.04)" : "none",
                zIndex: plan.is_popular ? 1 : 0,
                transition: "all 0.24s cubic-bezier(.4,0,.2,1)",
                opacity: isCurrent ? 0.92 : 1,
                background:
                  isCurrent
                    ? `linear-gradient(115deg, ${color}32 0%, #fff0 100%)`
                    : "#fff",
              }}
            >
              {/* Most Popular Badge */}
              {plan.is_popular && (
                <Chip label="POPULAR" sx={{
                  position: "absolute", top: 14, left: 16, bgcolor: color,
                  color: "white", fontWeight: 700, fontSize: "0.7rem"
                }} />
              )}
              <CardContent sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column" }}>
                {/* Header: fixed height to align across cards */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2, minHeight: 48 }}>
                  {getPlanIcon(plan.plan_type)}
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    {plan.name}
                  </Typography>
                </Box>
                {/* Price: fixed height and baseline aligned */}
                <Box sx={{ mb: 3, minHeight: 88, display: "flex", alignItems: "flex-end" }}>
                  {plan.plan_type === "enterprise" ? (
                    <Typography variant="h3" sx={{ color, fontWeight: 800 }}>Custom</Typography>
                  ) : (
                    <Stack direction="row" alignItems="flex-end" spacing={0.75}>
                      <Typography variant="h3" sx={{ color, fontWeight: 800 }}>
                        ${plan.price}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 500 }}>
                        /{plan.interval}
                      </Typography>
                    </Stack>
                  )}
                </Box>
                {/* Features List: grows to fill */}
                <List dense sx={{ mb: 0, flexGrow: 1 }}>
                  {plan.features.map((feature, i) => (
                    <ListItem key={i} disableGutters sx={{ py: 0.75 }}>
                      <ListItemIcon sx={{ color, minWidth: 30 }}>
                        <CheckCircleIcon />
                      </ListItemIcon>
                      <ListItemText primary={feature} primaryTypographyProps={{ variant: "body2" }} />
                    </ListItem>
                  ))}
                </List>
                {/* Action Button: stick to bottom */}
                <Button
                  fullWidth
                  variant={isCurrent ? "contained" : plan.is_popular ? "contained" : "outlined"}
                  sx={{
                    mt: 2, py: 1.4, borderRadius: 3, fontWeight: 700,
                    color: (isCurrent || plan.is_popular) ? "#fff" : color,
                    bgcolor: isCurrent ? color : plan.is_popular ? color : "#fff",
                    pointerEvents: isCurrent ? "none" : "auto"
                  }}
                  onClick={() => handleSubscribe(plan)}
                  disabled={processingPlan === plan.plan_type}
                >
                  {isCurrent ? "✓ Current Plan"
                    : processingPlan === plan.plan_type
                      ? <CircularProgress size={22} sx={{ color: "#fff" }} />
                      : plan.plan_type === "enterprise"
                        ? "Contact Sales"
                        : plan.plan_type === "free"
                          ? `Start ${plan.name} Plan`
                          : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Info Section (More space, centered icons) */}
      <Box
        sx={{
          mt: 8,
          p: 4,
          borderRadius: 3,
          background: "#f6f8fb",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: 4
        }}
      >
        {[
          ["Secure Payments", "Powered by Stripe"],
          ["Cancel Anytime", "No hidden fees"],
          ["14-Day Trial", "Risk-free experience"],
        ].map(([title, desc], i) => (
          <Box key={i} sx={{ textAlign: "center" }}>
            <Typography fontWeight={700}>{title}</Typography>
            <Typography variant="body2" color="#586178">{desc}</Typography>
          </Box>
        ))}
      </Box>

      {/* Snackbars/Dialogs */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        message={snackbar.message}
      />

      <Dialog open={contactDialog} onClose={() => setContactDialog(false)}>
        <DialogTitle>Contact Sales for the Enterprise Plan</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Please contact our sales team at <a href="mailto:sales@spoutbreeze.com">sales@spoutbreeze.com</a> for custom solutions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialog(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

