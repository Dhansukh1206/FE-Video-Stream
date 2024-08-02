import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuth({ token });
    } else {
      setAuth(null);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setAuth({ token });
    navigate("/shortvideo");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuth(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
