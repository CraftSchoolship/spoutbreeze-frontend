import { firebaseSignOut } from "@/lib/auth";
import axiosInstance from "@/lib/axios";

export interface LogoutResponse {
  message: string;
  statusCode: number;
}

export const logout = async (): Promise<LogoutResponse> => {
  try {
    // Backend revokes the Firebase refresh tokens and clears the session cookie.
    const response = await axiosInstance.post("/api/logout");

    // Sign out of the Firebase SDK session locally, then redirect.
    await firebaseSignOut();
    window.location.href = "/";

    return response.data;
  } catch (error) {
    console.error("Error logging out:", error);

    // Even if the backend call fails, clear the local Firebase session.
    await firebaseSignOut();
    window.location.href = "/";

    return {
      message: "Logout completed (with errors)",
      statusCode: 500,
    };
  }
};
