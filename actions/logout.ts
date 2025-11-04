import { clearTokens } from "@/lib/auth";
import axiosInstance from "@/lib/axios";

export interface LogoutResponse {
  message: string;
  statusCode: number;
}

export const logout = async (): Promise<LogoutResponse> => {
  try {
    // Backend gets refresh_token from cookies automatically
    const response = await axiosInstance.post("/api/logout");

    // Clear sessionStorage (cookies are already cleared by backend)
    clearTokens();
    window.location.href = '/';

    return response.data;
  } catch (error) {
    console.error("Error logging out:", error);
    
    // Even if logout fails, clear sessionStorage and redirect
    clearTokens();
    window.location.href = '/';
    
    return {
      message: "Logout completed (with errors)",
      statusCode: 500,
    };
  }
};
