import axios from 'axios'
import { refreshToken, clearTokens, getLoginUrl } from './auth'

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
          processQueue(error, null);
          // Avoid touching client storage in SSR
          if (!isServer) clearTokens();
          
          // Only redirect to login on the client
          if (!isServer) {
            const pathname = window.location?.pathname || '/';
            if (!isPublicPath(pathname)) {
              const loginUrl = await getLoginUrl();
              window.location.href = loginUrl;
            }
          }
          
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (!isServer) clearTokens();
        
        if (!isServer) {
          const pathname = window.location?.pathname || '/';
          if (!isPublicPath(pathname)) {
            const loginUrl = await getLoginUrl();
            window.location.href = loginUrl;
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