import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

export interface Organization {
  id: string;
  name: string;
  is_active: boolean;
  email_domains: string[];
  created_at: string;
  updated_at: string;
}

export interface OrganizationCreatePayload {
  name: string;
  email_domains: string[];
}

export interface OrganizationUpdatePayload {
  name?: string;
  email_domains?: string[];
  is_active?: boolean;
}

const extractError = (error: unknown, fallback: string): string => {
  const ax = error as AxiosError<{ detail?: string }>;
  return ax?.response?.data?.detail ?? ax?.message ?? fallback;
};

export const fetchOrganizations = async (): Promise<Organization[]> => {
  try {
    const response = await axiosInstance.get<Organization[]>(
      "/api/admin/organizations"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching organizations:", extractError(error, ""));
    return [];
  }
};

export const createOrganization = async (
  payload: OrganizationCreatePayload
): Promise<{ org?: Organization; error?: string }> => {
  try {
    const response = await axiosInstance.post<Organization>(
      "/api/admin/organizations",
      payload
    );
    return { org: response.data };
  } catch (error) {
    return { error: extractError(error, "Failed to create organization") };
  }
};

export const updateOrganization = async (
  orgId: string,
  payload: OrganizationUpdatePayload
): Promise<{ org?: Organization; error?: string }> => {
  try {
    const response = await axiosInstance.patch<Organization>(
      `/api/admin/organizations/${orgId}`,
      payload
    );
    return { org: response.data };
  } catch (error) {
    return { error: extractError(error, "Failed to update organization") };
  }
};

export const deleteOrganization = async (
  orgId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await axiosInstance.delete(`/api/admin/organizations/${orgId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: extractError(error, "Failed to delete organization"),
    };
  }
};

export const assignUserOrganization = async (
  userId: string,
  organizationId: string | null
): Promise<{ success: boolean; error?: string }> => {
  try {
    await axiosInstance.patch(`/api/users/${userId}/organization`, {
      organization_id: organizationId,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: extractError(error, "Failed to assign organization"),
    };
  }
};
