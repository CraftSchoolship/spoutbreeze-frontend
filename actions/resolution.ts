import axiosInstance from "@/lib/axios";

export async function getUserResolution() {
  try {
    const response = await axiosInstance.get("/api/me/resolution");
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Get resolution error:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Failed to fetch resolution",
    };
  }
}

export async function updateUserResolution(resolution: string) {
  try {
    const response = await axiosInstance.patch("/api/me/resolution", {
      default_resolution: resolution,
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Update resolution error:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Failed to update resolution",
    };
  }
}