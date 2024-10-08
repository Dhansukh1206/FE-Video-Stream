import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PublicRoute = ({ element, restricted = false }) => {
  const { auth } = useContext(AuthContext);

  console.log('PublicRoute auth', auth)
  return auth && restricted ? <Navigate to="/shortvideo" /> : element;
};

export default PublicRoute;
