import axios from 'axios'
import { refreshSession } from './auth'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Essential: always send the session cookie
})

// Prevent stampedes of concurrent re-auth attempts.
let isRefreshing = false
let refreshFailedAt = 0
const REFRESH_COOLDOWN_MS = 10_000
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let failedQueue: any[] = []

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(null)
  })
  failedQueue = []
}

// Paths where a 401 should NOT bounce the user to sign-in.
const publicPaths = ['/', '/auth/', '/join/']
const isPublicPath = (pathname: string) => publicPaths.some(p => pathname.includes(p))

const isServer = typeof window === 'undefined'

// On 401, try to silently re-establish the backend session from the live
// Firebase SDK session (it refreshes ID tokens on its own). If the Firebase
// session is also gone, bounce to the sign-in page.
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config

    // Never retry the session endpoint itself.
    if (originalRequest?.url?.includes('/api/session')) {
      return Promise.reject(error)
    }

    const now = Date.now()
    if (now - refreshFailedAt < REFRESH_COOLDOWN_MS) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => axiosInstance(originalRequest))
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const result = isServer ? null : await refreshSession()

        if (result) {
          processQueue(null)
          return axiosInstance(originalRequest)
        }

        refreshFailedAt = Date.now()
        processQueue(error)

        if (!isServer) {
          const pathname = window.location?.pathname || '/'
          if (!isPublicPath(pathname)) {
            window.location.href = '/auth/signin'
          }
        }
        return Promise.reject(error)
      } catch (refreshError) {
        refreshFailedAt = Date.now()
        processQueue(refreshError)

        if (!isServer) {
          const pathname = window.location?.pathname || '/'
          if (!isPublicPath(pathname)) {
            window.location.href = '/auth/signin'
          }
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
