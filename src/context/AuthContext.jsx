import { createContext, useContext, useState, useEffect } from "react";
import { getToken, setToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // عند التحميل الأول: نتحقق إذا في token + user محفوظين
  useEffect(() => {
    const token = getToken();
    const savedUser = localStorage.getItem("farfasha_admin_user");

    if (token && savedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(savedUser));
      } catch {
        setToken(null);
        localStorage.removeItem("farfasha_admin_user");
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    setToken(token);
    localStorage.setItem("farfasha_admin_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("farfasha_admin_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
