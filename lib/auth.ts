// lib/auth.ts
//
// Firebase Authentication client helpers. The frontend signs in with the
// Firebase Web SDK, then exchanges the resulting ID token for a backend
// httpOnly session cookie (POST /api/session). The session cookie is what the
// Next.js middleware and the API read for auth — the Firebase SDK session
// (refreshed silently) is only used to mint ID tokens.

import {
  GoogleAuthProvider,
  applyActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  verifyPasswordResetCode,
  type User as FirebaseUser,
} from "firebase/auth";

import { getFirebaseAuth } from "./firebase";
import { NEXT_PUBLIC_API_URL } from "@/config";

/**
 * Exchange a Firebase ID token for a backend session cookie.
 * `firstName`/`lastName` are only meaningful on email/password sign-up.
 */
const establishSession = async (
  firebaseUser: FirebaseUser,
  extra?: { firstName?: string; lastName?: string }
) => {
  const idToken = await firebaseUser.getIdToken(/* forceRefresh */ true);

  const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // backend sets the httpOnly session cookie
    body: JSON.stringify({
      id_token: idToken,
      first_name: extra?.firstName,
      last_name: extra?.lastName,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to establish session");
  }

  return response.json();
};

/** Email/password sign-in. */
export const signInWithEmail = async (email: string, password: string) => {
  const auth = getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return establishSession(cred.user);
};

/** Email/password sign-up. Sets the display name and establishes a session. */
export const signUpWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  const auth = getFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }

  return establishSession(cred.user, { firstName, lastName });
};

/** Google sign-in via popup. */
export const signInWithGoogle = async () => {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(auth, provider);
  return establishSession(cred.user);
};

/**
 * Request a password-reset email. Goes through our backend, which generates
 * the Firebase reset code and emails a link to our own /auth/action page via
 * the app's SMTP relay (so we don't depend on the Firebase-hosted handler).
 * Always resolves without revealing whether the email is registered.
 */
export const sendResetPasswordEmail = async (email: string) => {
  await fetch(`${NEXT_PUBLIC_API_URL}/api/password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
  });
};

/**
 * Validate a password-reset oobCode and return the account email.
 * Throws (auth/invalid-action-code, auth/expired-action-code) on a bad/used link.
 */
export const verifyResetCode = async (oobCode: string): Promise<string> => {
  const auth = getFirebaseAuth();
  return verifyPasswordResetCode(auth, oobCode);
};

/** Complete a password reset: set the new password for the oobCode's account. */
export const confirmReset = async (oobCode: string, newPassword: string) => {
  const auth = getFirebaseAuth();
  await confirmPasswordReset(auth, oobCode, newPassword);
};

/** Apply a verify-email / recover-email action code (same handler page). */
export const applyEmailActionCode = async (oobCode: string) => {
  const auth = getFirebaseAuth();
  await applyActionCode(auth, oobCode);
};

/**
 * Re-establish the backend session from the currently signed-in Firebase user.
 * Used after custom claims change server-side (e.g. creating an organization
 * grants the `admin` role) so the new session cookie carries the fresh claims.
 */
export const refreshSession = async () => {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return establishSession(user);
};

/** Sign out of Firebase locally (the backend clears the cookie separately). */
export const firebaseSignOut = async () => {
  try {
    await signOut(getFirebaseAuth());
  } catch {
    // ignore — backend logout + cookie clear is the source of truth
  }
};
