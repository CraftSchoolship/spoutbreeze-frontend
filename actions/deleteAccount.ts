import { clearTokens } from "@/lib/auth";
import axiosInstance from "@/lib/axios";

export interface DeleteAccountResponse {
    message: string;
    statusCode: number;
}

export const deleteAccount = async (): Promise<DeleteAccountResponse> => {
    try {
        const response = await axiosInstance.delete("/api/me");

        // Clear sessionStorage (cookies are already cleared by backend)
        clearTokens();
        window.location.href = "/";

        return response.data;
    } catch (error) {
        console.error("Error deleting account:", error);
        throw error;
    }
};
