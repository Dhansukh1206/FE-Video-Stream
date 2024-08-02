import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import ShortVideo from "./components/ShortVideo";
import Calls from "./components/Calls";
import Notification from "./components/Notification";
import LiveStream from "./components/LiveStream";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={<PublicRoute element={<Login />} restricted={true} />}
        />
        <Route
          path="/register"
          element={<PublicRoute element={<Register />} restricted={true} />}
        />
        <Route
          path="/shortvideo"
          element={<PrivateRoute element={ShortVideo} />}
        />
        <Route path="/calls" element={<PrivateRoute element={Calls} />} />
        <Route
          path="/notifications"
          element={<PrivateRoute element={Notification} />}
        />
        <Route
          path="/livestream"
          element={<PrivateRoute element={LiveStream} />}
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
