// lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging, getToken, isSupported } from 'firebase/messaging';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let messaging: Messaging | null = null;

// Initialize Firebase only on the client side
if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
}

/**
 * Validates that all required Firebase Web credentials are present.
 * The App ID and API Key must be generated in the Firebase Console
 * by adding a "Web App" to the project.
 */
export const isFirebaseConfigValid = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

/**
 * Initializes and returns the Firebase Messaging instance if supported by the browser.
 */
export const initializeMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined') return null;
  
  try {
    const supported = await isSupported();
    if (supported && app && !messaging) {
      messaging = getMessaging(app);
    }
    return messaging;
  } catch (error) {
    console.warn('[Firebase] Messaging not supported or failed to initialize', error);
    return null;
  }
};

/**
 * Registers the Firebase messaging service worker with the Firebase config
 * passed as query parameters, so the SW never needs hardcoded keys.
 */
const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | undefined> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return undefined;

  const swParams = new URLSearchParams({
    apiKey: firebaseConfig.apiKey ?? '',
    authDomain: firebaseConfig.authDomain ?? '',
    projectId: firebaseConfig.projectId ?? '',
    messagingSenderId: firebaseConfig.messagingSenderId ?? '',
    appId: firebaseConfig.appId ?? '',
  });

  return navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?${swParams.toString()}`
  );
};

/**
 * Retrieves the FCM device token if notification permissions are granted.
 */
export const getFCMToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  try {
    const msg = await initializeMessaging();
    if (!msg) return null;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('[Firebase] Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY in environment variables.');
      return null;
    }

    if (!isFirebaseConfigValid()) {
      console.warn('[Firebase] Missing some Firebase Web configuration variables like API_KEY or APP_ID. Please register a Web App in the Firebase console.');
      return null;
    }

    const swRegistration = await registerServiceWorker();

    const currentToken = await getToken(msg, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (currentToken) {
      return currentToken;
    } else {
      console.log('[Firebase] No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('[Firebase] An error occurred while retrieving token:', err);
    return null;
  }
};

export { app, messaging };
