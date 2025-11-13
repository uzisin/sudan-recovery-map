import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "./axiosConfig";



export default function Login() {
  const navigate = useNavigate();
const location = useLocation();
const from = location.state?.from?.pathname || "/home";
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ use your Laravel backend API route
const res = await api.post("/login", form); 
localStorage.setItem("token", res.data.token);

      // store token + user data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("✅ Login successful!");
      navigate(from, { replace: true }); // redirect to report or map
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #000216 0%, #1a1850 100%)",
        padding: "20px",
      }}
    >
      <div
        className="p-4 p-md-5 shadow-lg rounded-4"
        style={{
          backgroundColor: "rgba(10, 10, 40, 0.95)",
          backdropFilter: "blur(8px)",
          maxWidth: "400px",
          width: "100%",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 0 40px rgba(47,39,206,0.2)",
        }}
      >
        <h2
          className="text-center mb-4"
          style={{
            fontWeight: "700",
            letterSpacing: "1px",
            color: "#dedcff",
          }}
        >
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold text-light">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="example@mail.com"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                backgroundColor: "#000216",
                border: "1px solid #2f27ce",
                color: "#dedcff",
                borderRadius: "10px",
                padding: "12px",
              }}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold text-light">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                backgroundColor: "#000216",
                border: "1px solid #2f27ce",
                color: "#dedcff",
                borderRadius: "10px",
                padding: "12px",
              }}
            />
          </div>

          {error && (
            <div className="text-danger text-center mb-3" style={{ fontSize: "14px" }}>
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            className="btn w-100 fw-bold login-btn"
            disabled={loading}
            style={{
              background: "linear-gradient(90deg, #2f27ce, #5f4ff8)",
              color: "white",
              borderRadius: "10px",
              padding: "12px",
              border: "none",
              transition: "all 0.3s ease",
              fontSize: "16px",
              letterSpacing: "0.5px",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background =
                "linear-gradient(90deg, #5f4ff8, #8b83ff)")
            }
            onMouseLeave={(e) =>
              (e.target.style.background =
                "linear-gradient(90deg, #2f27ce, #5f4ff8)")
            }
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="d-flex justify-content-between mt-3">
          <Link
            to="/forgot-password"
            style={{
              color: "#6a7dff",
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            Forgot Password?
          </Link>
          <Link
            to="/register"
            style={{
              color: "#6a7dff",
              fontSize: "14px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Create Account
          </Link>
        </div>
      </div>
    </section>
  );
}
