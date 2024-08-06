import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const userName = localStorage.getItem("userName");

  return (
    <div
      className="d-flex flex-column p-3 bg-dark vh-100"
      style={{ width: "250px", minWidth: "250px" }}
    >
      <div className="d-flex row">
        <h2 className="text-center text-white">Welcome,</h2>
        <h2 className="text-center text-warning">{userName}</h2>
      </div>
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <Link
            to="/shortvideo"
            className={`nav-link link-light ${
              location.pathname === "/shortvideo" ? "active" : ""
            }`}
          >
            Short Video
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/calls"
            className={`nav-link link-light ${
              location.pathname === "/calls" ? "active" : ""
            }`}
          >
            Calls
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/livestream"
            className={`nav-link link-light ${
              location.pathname === "/livestream" ? "active" : ""
            }`}
          >
            Live Stream
          </Link>
        </li>
        <li className="mt-auto d-flex justify-content-center">
          <button className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
