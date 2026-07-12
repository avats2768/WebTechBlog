import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { disconnectChatSocket } from "../socket/chatSocket";
import { disconnectCallSocket } from "../socket/callSocket";

const logout = () => {
  disconnectChatSocket();
  disconnectCallSocket();

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.replace("/login");
};

const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
});

api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {

      try {

        const decoded = jwtDecode(token);

        if (decoded.exp * 1000 <= Date.now()) {

          logout();

          return Promise.reject(
            new Error("Token expired")
          );

        }

        config.headers.Authorization =
          `Bearer ${token}`;

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

    if (
      error.response &&
      error.response.status === 401
    ) {

      logout();

    }

    return Promise.reject(error);

  }

);

export default api;