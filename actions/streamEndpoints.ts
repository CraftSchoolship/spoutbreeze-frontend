import axiosInstance from "@/lib/axios";

export interface StreamEndpoints {
  id: string;
  title: string;
  rtmp_url: string;
  stream_key: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  user_first_name: string;
  user_last_name: string;
}

export interface StreamEndpointWithUserName extends StreamEndpoints {
  userName: string;
}

export interface createStreamEndpointReq {
  title: string;
  rtmp_url: string;
  stream_key: string;
}

export const fetchStreamEndpoints = async (): Promise<StreamEndpointWithUserName[]> => {
  try {
    const response = await axiosInstance.get("/api/stream-endpoint/");
    console.log("Fetch stream endpoints response:", response.data);

    // Transform the response to include userName
    const endpointsWithUserName: StreamEndpointWithUserName[] = response.data.map(
      (endpoint: StreamEndpoints) => ({
        ...endpoint,
        userName: `${endpoint.user_first_name} ${endpoint.user_last_name}`,
      })
    );

    return endpointsWithUserName;
  } catch (error) {
    console.error("Error fetching stream endpoints:", error);
    throw error;
  }
};

export const createStreamEndpoint = async (
  data: createStreamEndpointReq
): Promise<StreamEndpoints> => {
  try {
    const response = await axiosInstance.post(
      "/api/stream-endpoint/create",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating stream endpoint:", error);
    throw error;
  }
};

export const deleteStreamEndpoint = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/stream-endpoint/${id}`);
  } catch (error) {
    console.error("Error deleting stream endpoint:", error);
    throw error;
  }
};

export const updateStreamEndpoint = async (
  id: string,
  data: createStreamEndpointReq
): Promise<StreamEndpoints> => {
  try {
    const response = await axiosInstance.put(
      `/api/stream-endpoint/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating stream endpoint:", error);
    throw error;
  }
};

