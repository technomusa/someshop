import axios from "axios";
import { getSession } from "next-auth/react";

const baseURL = (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) ? process.env.NEXT_PUBLIC_API_BASE_URL : "http://127.0.0.1:8001/api";

// Determine if we're making cross-origin requests
const isCrossOrigin = () => {
  if (typeof window === "undefined") return false;
  const apiUrl = new URL(baseURL);
  const windowUrl = new URL(window.location.href);
  return apiUrl.origin !== windowUrl.origin;
};

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  // Enable credentials for cross-origin requests (CORS with credentials)
  withCredentials: typeof window !== "undefined" ? isCrossOrigin() : false,
});

// Attach token from NextAuth session if present
apiClient.interceptors.request.use(
  async (config) => {
    try {
      if (typeof window !== "undefined") {
        const session = await getSession();
        if (session?.accessToken) {
          config.headers = config.headers || {};
          if (!config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
          }
        }
      }
    } catch (e) {
      console.error("Failed to get session:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handler: on 401 clear session and redirect to login
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        if (typeof window !== "undefined") {
          // Only redirect if we're not already on the login page (prevent infinite redirects)
          if (!window.location.pathname.includes("/login") && window.location.pathname !== "/") {
            const current = window.location.pathname + window.location.search;
            window.location.href = `/login?redirect=${encodeURIComponent(current)}`;
          }
        }
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { apiClient };

