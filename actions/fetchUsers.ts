import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  keycloak_id: string;
  roles: string;
  created_at: string;
  is_active: boolean;
  organization_id: string | null;
  has_completed_onboarding: boolean;
}

// Helper functions to work with roles
export const getUserRoles = (user: User): string[] => {
  if (!user.roles) return [];
  return user.roles.split(',').map(role => role.trim()).filter(role => role);
};

export const hasRole = (user: User, role: string): boolean => {
  const roles = getUserRoles(user);
  return roles.includes(role);
};

export const hasAnyRole = (user: User, ...roles: string[]): boolean => {
  const userRoles = getUserRoles(user);
  return roles.some(role => userRoles.includes(role));
};

export const isAdmin = (user: User): boolean => {
  return hasRole(user, 'admin');
};

// Platform-wide back-office role. Gates admin analytics, cross-tenant user
// management, infra controls. The bare `admin` role is reserved for the
// future organization-scoped tier.
export const isSuperAdmin = (user: User): boolean => {
  return hasRole(user, 'super_admin');
};

export const isModerator = (user: User): boolean => {
  return hasRole(user, 'moderator');
};

export const getPrimaryRole = (user: User): string => {
  const roles = getUserRoles(user);
  if (roles.length === 0) return 'User';

  // Prioritize roles based on hierarchy
  if (roles.includes('super_admin')) return 'Super Admin';
  if (roles.includes('admin')) return 'Admin';
  if (roles.includes('moderator')) return 'Moderator';

  // Return the first role if no priority roles found
  return roles[0].charAt(0).toUpperCase() + roles[0].slice(1);
};

export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await axiosInstance.get("/api/me");
    return response.data;
  } catch (error) {
    // Return null for any error (including 401)
    // Don't log 401 errors as they're expected when not authenticated
    if ((error as AxiosError)?.response?.status !== 401) {
      console.error("Error fetching user data:", error);
    }
    return null;
  }
};

export const fetchUserById = async (userId: string): Promise<User | null> => {
  try {
    const response = await axiosInstance.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const fetchUsers = async (
  params: { skip?: number; limit?: number } = {}
): Promise<User[]> => {
  try {
    const response = await axiosInstance.get("/api/users", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export type AssignableRole = "super_admin" | "admin" | "moderator";

export const updateUserRole = async (
  userId: string,
  role: AssignableRole
): Promise<{ success: boolean; error?: string }> => {
  try {
    await axiosInstance.put(`/api/users/${userId}/role`, { role });
    return { success: true };
  } catch (error) {
    const ax = error as AxiosError<{ detail?: string }>;
    const message = ax.response?.data?.detail ?? ax.message ?? "Failed to update role";
    console.error("Error updating user role:", message);
    return { success: false, error: message };
  }
};

export const deleteUser = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await axiosInstance.delete(`/api/users/${userId}`);
    return { success: true };
  } catch (error) {
    const ax = error as AxiosError<{ detail?: string }>;
    const message =
      ax.response?.data?.detail ?? ax.message ?? "Failed to delete user";
    console.error("Error deleting user:", message);
    return { success: false, error: message };
  }
};
