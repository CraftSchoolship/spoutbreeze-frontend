import { firebaseSignOut } from "@/lib/auth";
import axiosInstance from "@/lib/axios";

export interface DeleteAccountResponse {
    message: string;
    statusCode: number;
}

export const deleteAccount = async (): Promise<DeleteAccountResponse> => {
    try {
        const response = await axiosInstance.delete("/api/me");

        // Backend deleted the Firebase user + cleared the cookie; clear the
        // local Firebase SDK session too.
        await firebaseSignOut();
        window.location.href = "/";

        return response.data;
    } catch (error) {
        console.error("Error deleting account:", error);
        throw error;
    }
};
