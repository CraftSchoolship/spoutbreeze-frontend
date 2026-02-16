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
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import BusinessIcon from "@mui/icons-material/Business";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useRouter } from "next/navigation";
import { getPlans, getSubscription, PlanInfo, Subscription } from "@/actions/subscription";

const FAQ_ITEMS = [
  {
    question: "Can I change my plan at any time?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately, and any prorated charges will be applied.",
  },
  {
    question: "What happens when my free trial ends?",
    answer:
      "When your 14-day trial ends, your account will be paused until you select a paid plan. Your data and settings will be preserved.",
  },
  {
    question: "Is there a long-term commitment?",
    answer:
      "No, all plans are billed monthly with no long-term contracts. You can cancel anytime without any cancellation fees.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe.",
  },
  {
    question: "What does the Enterprise plan include?",
    answer:
      "The Enterprise plan includes unlimited concurrent streams, 4K quality, 24/7 dedicated support, chat content filtering, OAuth integration, and advanced analytics. Contact us for custom pricing.",
  },
];

export default function PricingPage() {
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactDialog, setContactDialog] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, subData] = await Promise.all([
        getPlans(),
        getSubscription(),
      ]);
      setPlans(plansData);
      setSubscription(subData);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Determine the free plan button label and disabled state.
   * - Active trial → "Active" (disabled)
   * - Expired / used trial → "Trial Used" (disabled)
   * - User on a paid plan → "Start Free Trial" (disabled, can't downgrade here)
   * - No subscription (logged out / new) → "Start Free Trial" (enabled)
   */
  const getFreePlanButton = (): { label: string; disabled: boolean } => {
    if (!subscription) return { label: "Start Free Trial", disabled: false };

    if (subscription.plan === "free") {
      if (
        subscription.status === "trialing" &&
        subscription.trial_end &&
        new Date(subscription.trial_end) > new Date()
      ) {
        return { label: "Active", disabled: true };
      }
      // expired or any other non-active free state
      return { label: "Trial Used", disabled: true };
    }

    // User is on pro/enterprise – free trial no longer available
    if (subscription.status === "expired") {
      return { label: "Trial Used", disabled: true };
    }

    return { label: "Start Free Trial", disabled: true };
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
      case "free":
        return "#64748b";
      case "pro":
        return "#3b82f6";
      case "enterprise":
        return "#8b5cf6";
      default:
        return "#64748b";
    }
  };

  const handlePlanAction = (plan: PlanInfo) => {
    if (plan.plan_type === "enterprise") {
      setContactDialog(true);
      return;
    }
    router.push("/settings?tab=subscription");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress thickness={5} size={48} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero */}
      <Box sx={{ textAlign: "center", mb: 8 }}>
        <Typography variant="h3" fontWeight={800} sx={{ mb: 2 }}>
          Simple, Transparent Pricing
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ maxWidth: 600, mx: "auto" }}>
          Choose the plan that fits your streaming needs. Start with a free trial and upgrade anytime.
        </Typography>
      </Box>

      {/* Plan Cards */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={4}
        sx={{ mb: 8 }}
        justifyContent="center"
        alignItems={{ xs: "stretch", md: "stretch" }}
      >
        {plans.map((plan) => {
          const color = getPlanColor(plan.plan_type);
          return (
            <Card
              key={plan.plan_type}
              variant="outlined"
              sx={{
                flex: 1,
                maxWidth: { md: 360 },
                borderRadius: 4,
                border: plan.is_popular ? `2px solid ${color}` : "1px solid #e0e0e0",
                boxShadow: plan.is_popular
                  ? "0 8px 40px rgba(59, 130, 246, 0.15)"
                  : "0 2px 8px rgba(0,0,0,0.04)",
                transform: plan.is_popular ? "scale(1.04)" : "none",
                zIndex: plan.is_popular ? 1 : 0,
                position: "relative",
                transition: "all 0.24s cubic-bezier(.4,0,.2,1)",
                "&:hover": {
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  transform: plan.is_popular ? "scale(1.06)" : "scale(1.02)",
                },
              }}
            >
              {plan.is_popular && (
                <Chip
                  label="MOST POPULAR"
                  sx={{
                    position: "absolute",
                    top: 14,
                    left: 16,
                    bgcolor: color,
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                  }}
                />
              )}
              <CardContent
                sx={{
                  p: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2, minHeight: 48 }}>
                  {getPlanIcon(plan.plan_type)}
                  <Typography variant="h6" fontWeight={700}>
                    {plan.name}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3, minHeight: 88, display: "flex", alignItems: "flex-end" }}>
                  {plan.plan_type === "enterprise" ? (
                    <Typography variant="h3" sx={{ color, fontWeight: 800 }}>
                      Custom
                    </Typography>
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

                <Button
                  fullWidth
                  variant={plan.is_popular ? "contained" : "outlined"}
                  sx={{
                    mt: 2,
                    py: 1.4,
                    borderRadius: 3,
                    fontWeight: 700,
                    color: plan.is_popular ? "#fff" : color,
                    bgcolor: plan.is_popular ? color : "#fff",
                    borderColor: color,
                    "&:hover": {
                      bgcolor: plan.is_popular ? color : `${color}10`,
                      borderColor: color,
                    },
                    ...(plan.plan_type === "free" && getFreePlanButton().disabled
                      ? { opacity: 0.7, pointerEvents: "none" }
                      : {}),
                  }}
                  onClick={() => handlePlanAction(plan)}
                  disabled={plan.plan_type === "free" ? getFreePlanButton().disabled : false}
                >
                  {plan.plan_type === "enterprise"
                    ? "Contact Sales"
                    : plan.plan_type === "free"
                      ? getFreePlanButton().label
                      : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Trust Indicators */}
      <Box
        sx={{
          p: 4,
          borderRadius: 3,
          background: "#f6f8fb",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          mb: 8,
        }}
      >
        {[
          ["Secure Payments", "Powered by Stripe"],
          ["Cancel Anytime", "No hidden fees"],
          ["14-Day Trial", "Risk-free experience"],
        ].map(([title, desc], i) => (
          <Box key={i} sx={{ textAlign: "center" }}>
            <Typography fontWeight={700}>{title}</Typography>
            <Typography variant="body2" color="#586178">
              {desc}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* FAQ Section */}
      <Box sx={{ maxWidth: 700, mx: "auto" }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 4, textAlign: "center" }}>
          Frequently Asked Questions
        </Typography>
        {FAQ_ITEMS.map((item, i) => (
          <Accordion
            key={i}
            disableGutters
            elevation={0}
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: "12px !important",
              mb: 2,
              "&:before": { display: "none" },
              overflow: "hidden",
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>{item.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Enterprise Contact Dialog */}
      <Dialog open={contactDialog} onClose={() => setContactDialog(false)}>
        <DialogTitle>Contact Sales for Enterprise Plan</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Please contact our sales team at{" "}
            <a href="mailto:sales@spoutbreeze.com">sales@spoutbreeze.com</a> for custom enterprise
            solutions and pricing.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
