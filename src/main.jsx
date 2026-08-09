// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App.jsx";
import AuthProvider from "./context/AuthContext.jsx";
import { BrowserRouter as Router } from "react-router-dom";

// Central API base URL — set once here, all axios calls use relative paths.
// Configure per environment via VITE_API_URL (.env); falls back to local dev.
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL;// || "http://localhost:5000";

// Send the httpOnly auth cookies with every request.
axios.defaults.withCredentials = true;

// On a 401 (expired access token), try refreshing once, then retry the request.
let isRefreshing = false;
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || "";

    // Don't try to refresh for the auth endpoints themselves.
    const isAuthCall =
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/refresh") ||
      url.includes("/api/auth/logout");

    if (status === 401 && !original?._retry && !isAuthCall) {
      original._retry = true;
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          await axios.post("/api/auth/refresh");
          isRefreshing = false;
        }
        return axios(original); // retry with the new access cookie
      } catch (refreshErr) {
        isRefreshing = false;
        // Refresh failed → session is over. Clear local user and go to login.
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <Router>
      <App />
    </Router>
  </AuthProvider>
 
);
