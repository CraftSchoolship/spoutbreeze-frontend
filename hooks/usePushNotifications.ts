import { useState, useEffect, useCallback } from 'react';
import { getFCMToken } from '@/lib/firebase';
import { registerFCMToken } from '@/lib/fcmApi';

export interface UsePushNotificationsReturn {
  token: string | null;
  permission: NotificationPermission;
  error: Error | null;
  requestPermission: () => Promise<void>;
  isSupported: boolean;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [error, setError] = useState<Error | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // Initialize permission state
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    } else {
      setIsSupported(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError(new Error('Push notifications are not supported in this browser.'));
      return;
    }

    try {
      console.log('[usePushNotifications] Requesting permission...');
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        console.log('[usePushNotifications] Permission granted. Fetching FCM token...');
        const fcmToken = await getFCMToken();
        
        if (fcmToken) {
          setToken(fcmToken);
          console.log('[usePushNotifications] FCM Token obtained. Registering with backend...');
          
          await registerFCMToken(fcmToken, navigator.userAgent);
          console.log('[usePushNotifications] Token successfully registered with backend.');
        } else {
          console.warn('[usePushNotifications] Failed to obtain FCM token.');
          setError(new Error('Failed to obtain FCM token'));
        }
      } else {
        console.warn('[usePushNotifications] Permission denied or dismissed.');
        setError(new Error(`Notification permission ${perm}`));
      }
    } catch (err) {
      console.error('[usePushNotifications] Error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [isSupported]);

  // Attempt to auto-fetch token if permission is already granted,
  // but don't prompt the user immediately if it's "default".
  // This helps when returning to the app after having already granted permission.
  useEffect(() => {
    if (permission === 'granted' && !token) {
      requestPermission();
    }
  }, [permission, token, requestPermission]);

  return {
    token,
    permission,
    error,
    requestPermission,
    isSupported,
  };
};
