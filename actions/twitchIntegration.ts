export interface TwitchTokenStatus {
  user_id: string;
  has_token: boolean;
  token_preview?: string;
  expires_at: string;
  current_time: string;
  time_until_expiry: string;
  is_expired: boolean;
  expires_soon: boolean;
  has_refresh_token: boolean;
  created_at: string;
  error?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function authFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  // If you use cookies (HttpOnly) for auth, credentials: include
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || res.statusText);
  }
  return res.json();
}

export const getTwitchAuthUrl = () =>
  authFetch<{ authorization_url: string; user_id: string }>(
    `${API_BASE}/auth/twitch/login`
  );

export const getTwitchTokenStatus = () =>
  authFetch<TwitchTokenStatus>(`${API_BASE}/auth/twitch/token-status`);

export const revokeTwitchToken = () =>
  authFetch<{ message: string }>(`${API_BASE}/auth/twitch/token`, {
    method: "DELETE",
  });

export const startTwitchConnection = () =>
  authFetch<{ connected: boolean }>(`${API_BASE}/auth/twitch/connect`, {
    method: "POST",
  });