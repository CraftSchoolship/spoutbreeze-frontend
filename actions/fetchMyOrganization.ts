import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { refreshSession } from "@/lib/auth";

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

// -----------------------------------------------------------------------------
// Self-serve onboarding
// -----------------------------------------------------------------------------

export interface DomainVerificationStatus {
  domain: string;
  verified: boolean;
  verification_token: string | null;
  verification_record_name: string | null;
  verification_record_value: string | null;
}

export interface CreateMyOrgResponse {
  organization: Organization;
  verification: DomainVerificationStatus;
  // Backend granted the `admin` role as a Firebase custom claim; the client
  // must re-establish its session to pick it up.
  session_refresh_required?: boolean;
}

export interface OrganizationInviteResponse {
  code: string;
  organization_id: string;
  created_at: string;
  revoked_at: string | null;
  expires_at: string | null;
  join_path: string;
}

export const createMyOrganization = async (
  name: string,
  emailDomain: string
): Promise<{ data?: CreateMyOrgResponse; error?: string }> => {
  try {
    const response = await axiosInstance.post<CreateMyOrgResponse>(
      "/api/me/organization/create",
      { name, email_domain: emailDomain }
    );
    // The backend just granted the `admin` role as a Firebase custom claim,
    // but our current session cookie predates it. Re-mint the session so the
    // new role is reflected before navigating to /my-org.
    if (response.data?.session_refresh_required) {
      try {
        await refreshSession();
      } catch {
        // Non-fatal — user can sign out/in to pick up the role manually.
      }
    }
    return { data: response.data };
  } catch (error) {
    return { error: extractError(error, "Failed to create organization") };
  }
};

export const joinOrganization = async (
  code: string
): Promise<{ data?: { organization: Organization }; error?: string }> => {
  try {
    const response = await axiosInstance.post<{ organization: Organization }>(
      "/api/me/organization/join",
      { code }
    );
    return { data: response.data };
  } catch (error) {
    return { error: extractError(error, "Failed to join organization") };
  }
};

export const skipOnboarding = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    await axiosInstance.post("/api/me/organization/skip-onboarding");
    return { success: true };
  } catch (error) {
    return { success: false, error: extractError(error, "Failed to skip onboarding") };
  }
};

// Org admin only: trigger the DNS TXT-record check for the pending domain.
// Legacy convenience wrapper around the first pending domain.
export const verifyMyOrgDomain = async (): Promise<{
  data?: DomainVerificationStatus;
  error?: string;
}> => {
  try {
    const response = await axiosInstance.post<DomainVerificationStatus>(
      "/api/me/organization/verify-domain"
    );
    return { data: response.data };
  } catch (error) {
    return { error: extractError(error, "Failed to verify domain") };
  }
};

// Org admin only: add a new pending email domain to the org.
export const addMyOrgDomain = async (
  domain: string
): Promise<{ data?: DomainVerificationStatus; error?: string }> => {
  try {
    const response = await axiosInstance.post<DomainVerificationStatus>(
      "/api/me/organization/domains",
      { domain }
    );
    return { data: response.data };
  } catch (error) {
    return { error: extractError(error, "Failed to add domain") };
  }
};

// Org admin only: trigger DNS check for a specific domain on the caller's org.
export const verifyMyOrgDomainByName = async (
  domain: string
): Promise<{ data?: DomainVerificationStatus; error?: string }> => {
  try {
    const response = await axiosInstance.post<DomainVerificationStatus>(
      `/api/me/organization/domains/${encodeURIComponent(domain)}/verify`
    );
    return { data: response.data };
  } catch (error) {
    return { error: extractError(error, "Failed to verify domain") };
  }
};

// Org admin only: remove a domain from the caller's org.
export const deleteMyOrgDomain = async (
  domain: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await axiosInstance.delete(
      `/api/me/organization/domains/${encodeURIComponent(domain)}`
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: extractError(error, "Failed to delete domain") };
  }
};

// Org admin only: returns the current active invite (creates one on demand).
export const getMyOrgInvite = async (): Promise<OrganizationInviteResponse | null> => {
  try {
    const response = await axiosInstance.get<OrganizationInviteResponse>(
      "/api/me/organization/invite"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching invite:", extractError(error, ""));
    return null;
  }
};

// Org admin only: revoke current invite + create new.
export const rotateMyOrgInvite = async (): Promise<{
  data?: OrganizationInviteResponse;
  error?: string;
}> => {
  try {
    const response = await axiosInstance.post<OrganizationInviteResponse>(
      "/api/me/organization/invite/rotate"
    );
    return { data: response.data };
  } catch (error) {
    return { error: extractError(error, "Failed to rotate invite") };
  }
};
