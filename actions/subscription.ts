"use server";

import { cookies } from "next/headers";
import axiosInstance from "@/lib/axios";

export interface PlanLimits {
  max_quality: string;
  max_concurrent_streams: number | null;
  max_stream_duration_hours: number | null;
  support_response_hours: number;
  support_channels: string[];
  chat_filter: boolean;
  oauth_enabled: boolean;
  analytics_enabled: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  plan: "free" | "pro" | "enterprise";
  status: string;
  trial_start: string | null;
  trial_end: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
  limits?: PlanLimits;
}

export interface PlanInfo {
  name: string;
  plan_type: "free" | "pro" | "enterprise";
  price: number;
  currency: string;
  interval: string;
  features: string[];
  limits: PlanLimits;
  stripe_price_id: string;
  stripe_product_id: string;
  is_popular: boolean;
}

export interface Transaction {
  id: string;
  subscription_id: string;
  stripe_payment_intent_id: string;
  stripe_invoice_id: string | null;
  amount: number;
  currency: string;
  transaction_type: string;
  status: string;
  description: string | null;
  receipt_url: string | null;
  created_at: string;
}

/**
 * Get user's current subscription
 */
export async function getSubscription(): Promise<Subscription | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return null;
    }

    const response = await axiosInstance.get("/api/payments/subscription", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Failed to get subscription:", error);
    return null;
  }
}

/**
 * Get available subscription plans
 */
export async function getPlans(): Promise<PlanInfo[]> {
  try {
    const response = await axiosInstance.get("/api/payments/plans");
    return response.data;
  } catch (error: any) {
    console.error("Failed to get plans:", error);
    return [];
  }
}

/**
 * Create a checkout session for a subscription
 */
export async function createCheckoutSession(
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ session_id: string; url: string } | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await axiosInstance.post(
      "/api/payments/checkout",
      {
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Failed to create checkout session:", error);
    throw error;
  }
}

/**
 * Create a customer portal session
 */
export async function createCustomerPortal(
  returnUrl: string
): Promise<{ url: string } | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await axiosInstance.post(
      "/api/payments/portal",
      {
        return_url: returnUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Failed to create portal session:", error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  cancelImmediately: boolean = false
): Promise<Subscription | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await axiosInstance.post(
      "/api/payments/subscription/cancel",
      {
        cancel_immediately: cancelImmediately,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Failed to cancel subscription:", error);
    throw error;
  }
}

/**
 * Get user's transaction history
 */
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return [];
    }

    const response = await axiosInstance.get("/api/payments/transactions", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Failed to get transactions:", error);
    return [];
  }
}

/**
 * Get current user's plan limits
 */
export async function getPlanLimits(): Promise<PlanLimits | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return null;
    }

    const response = await axiosInstance.get("/api/payments/limits", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Failed to get plan limits:", error);
    return null;
  }
}
