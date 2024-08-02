import React, { useState, useContext } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/auth/login", { username, password });
      const { token, expiresIn } = response.data;
      alert(`${token}`);
      localStorage.setItem("token", token);
      const expirationTime = Date.now() + expiresIn * 1000;
      localStorage.setItem("expirationTime", expirationTime);
      login(response.data.token);
      navigate("/shortvideo");
    } catch (error) {
      alert(`error: ${error}`);
      setError("Invalid credentials");
    }
  };

  return (
    <div className="container mt-5 py-5 px-4 w-25 bg-light border rounded-3 border-dark">
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            Email address
          </label>
          <input
            type="text"
            placeholder="Username"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputPassword1" className="form-label">
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            className="form-control"
            id="exampleInputPassword1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-100 btn btn-primary">
          Login
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
