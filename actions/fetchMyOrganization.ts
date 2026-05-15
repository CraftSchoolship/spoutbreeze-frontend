import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

import type { Organization } from "@/actions/fetchOrganizations";
import type { AnalyticsOverview } from "@/actions/fetchAdminAnalytics";
import type { User } from "@/actions/fetchUsers";

const extractError = (error: unknown, fallback: string): string => {
  const ax = error as AxiosError<{ detail?: string }>;
  return ax?.response?.data?.detail ?? ax?.message ?? fallback;
};

// Returns the user's organization, or null if they have none / aren't allowed.
export const fetchMyOrganization = async (): Promise<Organization | null> => {
  try {
    const response = await axiosInstance.get<Organization>("/api/me/organization");
    return response.data;
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status !== 404 && status !== 403) {
      console.error("Error fetching my organization:", extractError(error, ""));
    }
    return null;
  }
};

// Org admin only: returns analytics scoped to the caller's org.
export const fetchMyOrgOverview = async (): Promise<AnalyticsOverview | null> => {
  try {
    const response = await axiosInstance.get<AnalyticsOverview>(
      "/api/me/organization/overview"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching my org overview:", extractError(error, ""));
    return null;
  }
};

// Org admin only: list users in the caller's org.
export const fetchMyOrgUsers = async (): Promise<User[]> => {
  try {
    const response = await axiosInstance.get<User[]>("/api/me/organization/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching my org users:", extractError(error, ""));
    return [];
  }
};

// Org admin only: change a member's role within the org (moderator|admin).
export const updateMyOrgUserRole = async (
  userId: string,
  role: "moderator" | "admin"
): Promise<{ success: boolean; error?: string }> => {
  try {
    await axiosInstance.patch(`/api/me/organization/users/${userId}/role`, { role });
    return { success: true };
  } catch (error) {
    return { success: false, error: extractError(error, "Failed to update role") };
  }
};
