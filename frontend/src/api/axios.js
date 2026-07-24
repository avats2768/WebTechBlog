import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { disconnectChatSocket } from "../socket/chatSocket";
import { disconnectCallSocket } from "../socket/callSocket";

// Endpoints that are public (no JWT required) and must never trigger the
// "session expired" logout/redirect flow. Bad credentials on /auth/login,
// a used/expired token on /auth/verify-email, etc. are ordinary,
// user-facing errors — not proof that the user's session died.
const PUBLIC_AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/resend-verification-email",
];

const isPublicAuthRequest = (config) => {
  const url = config?.url || "";
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
};

const logout = () => {
  disconnectChatSocket();
  disconnectCallSocket();

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.replace("/login");
};

const api = axios.create({
  baseURL: import.meta.env.VITE_TECH_API_URL,
});

api.interceptors.request.use(
  (config) => {
    // Public auth endpoints never need a bearer token. Skipping this block
    // for them also avoids a leftover/expired token in localStorage forcing
    // a logout+redirect before the request (e.g. verify-email, resend-
    // verification, login, register) ever reaches the network.
    if (isPublicAuthRequest(config)) {
      return config;
    }

    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        if (decoded.exp * 1000 <= Date.now()) {
          logout();
          return Promise.reject(new Error("Token expired"));
        }

        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        logout();
        return Promise.reject(error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const isPublic = isPublicAuthRequest(error.config || {});

    // A 401 from login (wrong credentials), register, verify-email, or
    // resend-verification is a normal error the page needs to render
    // itself — it must NOT trigger a global logout + hard redirect,
    // which previously wiped out the error message before the user
    // ever saw it.
    if (status === 401 && !isPublic) {
      logout();
    }

    return Promise.reject(error);
  }
);

export default api;