export interface YouTubeTokenStatus {
  user_id: string;
  has_token: boolean;
  token_preview?: string | null;
  expires_at: string;
  current_time: string;
  time_until_expiry: string;
  is_expired: boolean;
  expires_soon: boolean;
  has_refresh_token: boolean;
  created_at: string;
  error?: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function authFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
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

export const getYouTubeAuthUrl = () =>
  authFetch<{ authorization_url: string; user_id: string }>(
    `${API_BASE}/api/auth/youtube/login`
  );

export const getYouTubeTokenStatus = () =>
  authFetch<YouTubeTokenStatus>(`${API_BASE}/api/auth/youtube/token-status`);

export const revokeYouTubeToken = () =>
  authFetch<{ message: string }>(`${API_BASE}/api/auth/youtube/token`, {
    method: "DELETE",
  });

// export const startYouTubeConnection = () =>
//   authFetch<{ message: string; user_id: string }>(
//     `${API_BASE}/api/auth/youtube/connect`,
//     { method: "POST" }
//   );