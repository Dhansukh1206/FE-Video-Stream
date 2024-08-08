import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "./Sidebar";

const PrivateRoute = ({ element: Component }) => {
  const { auth } = useContext(AuthContext);

  return auth ? (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-3">
        <Component />
      </div>
    </div>
  ) : (
    <Navigate to="/" />
  );
};

export default PrivateRoute;
