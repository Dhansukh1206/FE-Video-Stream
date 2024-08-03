import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/register", { username, password });
      setMessage("User registered successfully");
      const interval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        navigate("/");
      }, 5000);
    } catch (error) {
      setError("User already exists");
      setMessage("");
    }
  };

  useEffect(() => {
    if (error) {
      setCountdown(5);
    }
  }, [error]);

  return (
    <div className="container mt-5 py-5 px-4 w-25 bg-light border rounded-3 border-dark">
      <form onSubmit={handleRegister}>
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
          Register
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && (
          <p style={{ color: "green" }}>
            {message} - Redirecting in {countdown} seconds...
          </p>
        )}
        <p>
          Don't have an account? <a href="/">Login here</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
