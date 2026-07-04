import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AdminAuthContext = createContext(null);

const API_BASE_URL = "http://localhost:5000/api/admin";

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("adminToken") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Restore session on mount / refresh
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("adminToken");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.data.success && response.data.admin) {
          setAdmin(response.data.admin);
          setToken(storedToken);
        } else {
          logout();
        }
      } catch (err) {
        console.error("Failed to restore admin session:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    setError("");
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email: email.trim(),
        password,
      });

      if (response.data.success) {
        const { token: newToken, admin: adminData } = response.data;

        localStorage.setItem("adminToken", newToken);
        localStorage.setItem("adminData", JSON.stringify(adminData));

        setToken(newToken);
        setAdmin(adminData);
        return { success: true };
      } else {
        setError(response.data.message || "Login failed");
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Invalid credentials or server error";
      setError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        loading,
        error,
        setError,
        login,
        logout,
        isAuthenticated: !!token && !!admin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
