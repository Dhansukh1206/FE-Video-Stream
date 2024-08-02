import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div
      className="d-flex flex-column p-3 bg-dark vh-100"
      style={{ width: "250px", minWidth: "250px" }}
    >
      <h2 className="text-center text-light">Kit-Kot</h2>
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <Link to="/shortvideo" className="nav-link link-light">
            Short Video
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/calls" className="nav-link link-light">
            Calls
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/notifications" className="nav-link link-light">
            Notification
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/livestream" className="nav-link link-light">
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
