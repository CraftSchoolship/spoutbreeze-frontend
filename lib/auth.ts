import {
  KEYCLOAK_SERVER_URL,
  KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_REDIRECT_URI,
  NEXT_PUBLIC_API_URL,
} from "@/config";
import { generateCodeVerifier, generateCodeChallenge } from "./pkce";

// Generate PKCE values
export const initPKCE = async () => {
  // Generate and store PKCE values
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store code verifier in sessionStorage
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem("code_verifier", codeVerifier);
    } catch (_) {
      // ignore storage errors in restricted environments
    }
  }

  return { codeVerifier, codeChallenge };
};

export const getLoginUrl = async () => {
  // Initialize PKCE
  const { codeChallenge } = await initPKCE();

  const url = `${KEYCLOAK_SERVER_URL}realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?client_id=${KEYCLOAK_CLIENT_ID}&response_type=code&scope=openid&redirect_uri=${encodeURIComponent(
    KEYCLOAK_REDIRECT_URI ?? ""
  )}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  
  return url;
};

// Send code to FastAPI backend for token exchange
export const exchangeCodeForToken = async (code: string) => {
  const codeVerifier = typeof window !== "undefined"
    ? sessionStorage.getItem("code_verifier")
    : null;

  if (!codeVerifier) {
    throw new Error("Code verifier not found");
  }

  // Backend will set httpOnly cookies
  const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Important: include cookies
    body: JSON.stringify({
      code,
      redirect_uri: KEYCLOAK_REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for token");
  }
  
  // Clear the code verifier after successful exchange
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("code_verifier");
    } catch (_) {}
  }
  
  const data = await response.json();
  return data;
};

// Clear sessionStorage only
export const clearTokens = () => {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("code_verifier");
    } catch (_) {
      // ignore if storage not accessible
    }
  }
  // Note: HTTP-only cookies are cleared by the backend logout endpoint
};

export const refreshToken = async () => {
  try {
    const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include cookies
    });

    if (!response.ok) {
      return null; // Return null on failure
    }

    const data = await response.json();
    return data; // Return user info
  } catch (error) {
    console.error("Refresh token error:", error);
    return null; // Return null instead of redirecting
  }
};

// Check if user is authenticated (client-side helper)
export const isAuthenticated = (): boolean => {
  // Since we're using HTTP-only cookies, we can't check directly on client
  // This is mainly for client-side logic, the real auth check happens on server
  if (typeof window === 'undefined') return false;
  
  // You could store a flag in localStorage when auth succeeds, or use other methods
  // For now, we'll rely on the API call in components
  return false;
};
