import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Login from "./Login";
import Register from "./register";
import Home from "./home";
import Stories from "./Stories";
import Map from "./Map";
import Reports from "./Reports";
import Profile from "./Profile";
import RecoveryDashboard from "./RecoveryDashboard";
import axios from "axios";

axios.defaults.baseURL = "http://127.0.0.1:8000";
axios.defaults.withCredentials = true;

const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}



function App() {
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <Router>
      <Routes>
        {/* Redirect from / to /home */}
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/Stories" element={<Stories />} />
        <Route path="/Map" element={<Map />} />
        <Route path="/dashboard" element={<RecoveryDashboard />} />
        <Route
  path="/Reports"
  element={
    isLoggedIn ? (
      <Reports />
    ) : (
      <Navigate to="/Login" state={{ from: { pathname: "/reports" } }} replace />
    )
  }
/>

    <Route
          path="/profile"
          element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
        />
        
      </Routes>
    </Router>
  );
}

export default App;
