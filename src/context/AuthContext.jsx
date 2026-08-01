import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

// No password for now - just pick a role and log straight in.
  const login = async (role) => {
    const { data } = await api.post("/auth/login", { role });
    localStorage.setItem("hms_token", data.token);
    const userData = { role: data.role, name: data.full_name, staffId: data.staff_id };
    setUser(userData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("hms_token");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}