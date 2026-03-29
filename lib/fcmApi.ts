// lib/fcmApi.ts
import api from '@/lib/axios';

export interface FCMTokenRegisterResponse {
  status: string;
  message: string;
}

/**
 * Sends the FCM device token to the backend to link it with the current user.
 * 
 * @param token The FCM registration token
 * @param deviceInfo Optional string describing the browser/device (e.g. "Chrome/macOS")
 */
export const registerFCMToken = async (
  token: string,
  deviceInfo?: string
): Promise<FCMTokenRegisterResponse> => {
  const response = await api.post('/api/notifications/fcm-token', {
    token,
    device_info: deviceInfo,
  });
  return response.data;
};

/**
 * Removes the FCM device token from the backend.
 * 
 * @param token The FCM registration token to remove
 */
export const unregisterFCMToken = async (
  token: string
): Promise<FCMTokenRegisterResponse> => {
  const response = await api.delete('/api/notifications/fcm-token', {
    data: { token },
  });
  return response.data;
};
