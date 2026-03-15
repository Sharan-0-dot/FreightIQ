import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "driver" or "company"

  useEffect(() => {
    const savedUser = localStorage.getItem("freightiq_user");
    const savedRole = localStorage.getItem("freightiq_role");
    if (savedUser && savedRole) {
      setUser(JSON.parse(savedUser));
      setRole(savedRole);
    }
  }, []);

  const login = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
    localStorage.setItem("freightiq_user", JSON.stringify(userData));
    localStorage.setItem("freightiq_role", userRole);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("freightiq_user");
    localStorage.removeItem("freightiq_role");
  };

  const isCompany = () => role === "company";
  const isDriver = () => role === "driver";

  return (
    <AuthContext.Provider value={{ user, role, login, logout, isCompany, isDriver }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);