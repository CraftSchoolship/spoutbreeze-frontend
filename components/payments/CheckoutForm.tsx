"use client";

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";

interface CheckoutFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  returnUrl: string;
}

export default function CheckoutForm({ onSuccess, onCancel, returnUrl }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (submitError) {
      setError(submitError.message || "Payment failed. Please try again.");
      setProcessing(false);
    } else {
      onSuccess?.();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Payment Details
      </Typography>

      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        {onCancel && (
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={processing}
            fullWidth
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={!stripe || processing}
          fullWidth
          sx={{
            py: 1.5,
            fontWeight: 700,
            bgcolor: "#525cfa",
            "&:hover": { bgcolor: "#4049d6" },
          }}
        >
          {processing ? <CircularProgress size={22} color="inherit" /> : "Subscribe"}
        </Button>
      </Box>
    </Box>
  );
}
