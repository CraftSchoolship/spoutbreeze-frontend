export interface FacebookTokenStatus {
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

export interface FacebookPage {
    page_id: string;
    is_active: boolean;
    is_expired: boolean;
    created_at: string | null;
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

export const getFacebookAuthUrl = () =>
    authFetch<{ authorization_url: string; user_id: string }>(
        `${API_BASE}/api/auth/facebook/login`
    );

export const getFacebookTokenStatus = () =>
    authFetch<FacebookTokenStatus>(`${API_BASE}/api/auth/facebook/token-status`);

export const revokeFacebookToken = () =>
    authFetch<{ message: string }>(`${API_BASE}/api/auth/facebook/token`, {
        method: "DELETE",
    });

export const getFacebookPages = () =>
    authFetch<{ pages: FacebookPage[] }>(
        `${API_BASE}/api/auth/facebook/pages`
    );
