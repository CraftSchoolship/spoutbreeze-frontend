import axios from 'axios'
import { refreshToken } from './auth'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Essential: always send cookies
})

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false;
// Cooldown: skip refresh attempts for a period after a failure
let refreshFailedAt = 0;
const REFRESH_COOLDOWN_MS = 10_000; // 10 seconds
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let failedQueue: any[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// List of paths where 401 should NOT trigger redirect to login
const publicPaths = ['/', '/auth/', '/join/'];

const isPublicPath = (pathname: string) => {
  return publicPaths.some(path => pathname.includes(path));
};

// Detect server environment
const isServer = typeof window === 'undefined';

// Simplified response interceptor with loop prevention
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Never try to refresh the refresh endpoint itself
    if (originalRequest?.url?.includes('/api/refresh')) {
      return Promise.reject(error);
    }

    // If we recently failed a refresh, don't try again (cooldown)
    const now = Date.now();
    if (now - refreshFailedAt < REFRESH_COOLDOWN_MS) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshSuccess = await refreshToken();

        if (refreshSuccess) {
          processQueue(null);
          return axiosInstance(originalRequest);
        } else {
          // Mark cooldown so no more refresh attempts for a while
          refreshFailedAt = Date.now();
          processQueue(error, null);

          // Only clear access token and redirect to home, not to Keycloak login
          if (!isServer) {
            document.cookie = 'access_token=; path=/; max-age=0';
            const pathname = window.location?.pathname || '/';
            if (!isPublicPath(pathname)) {
              window.location.href = '/';
            }
          }

          return Promise.reject(error);
        }
      } catch (refreshError) {
        refreshFailedAt = Date.now();
        processQueue(refreshError, null);

        // Only clear access token and redirect to home
        if (!isServer) {
          document.cookie = 'access_token=; path=/; max-age=0';
          const pathname = window.location?.pathname || '/';
          if (!isPublicPath(pathname)) {
            window.location.href = '/';
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
)

export default axiosInstance