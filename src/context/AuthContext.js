import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null || localStorage?.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && validateToken(token)) {
      setAuth({ token });
    } else {
      setAuth(null);
    }
  }, []);

  const validateToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const currentDate = new Date(currentTime * 1000); // Convert to milliseconds
      const expirationDate = new Date(decoded.exp * 1000); // Convert to milliseconds

      console.log("Current Date:", currentDate.toLocaleString());
      console.log("Token Expiration Date:", expirationDate.toLocaleString());

      console.log("decoded.exp > currentTime", decoded.exp, currentTime);
      return decoded.exp > currentTime;
    } catch (error) {
      console.error("Invalid token:", error);
      return false;
    }
  };

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
