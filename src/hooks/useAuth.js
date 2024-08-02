// src/hooks/useAuth.js
import { useNavigate } from "react-router-dom";
import instance from "../api/axios";

const useAuth = () => {
  const navigate = useNavigate();

  const setupInterceptors = () => {
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );
  };

  return { setupInterceptors };
};

export default useAuth;
