import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./axiosConfig"; 

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
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
      const res = await api.post("/register", form);
localStorage.setItem("token", res.data.token);

      alert("🎉 Registration successful!");
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "Registration failed. Please check your inputs."
      );
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
          maxWidth: "420px",
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
          Create Account
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-3">
            <label htmlFor="name" className="form-label fw-semibold text-light">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="form-control"
              placeholder="Enter your full name"
              value={form.name}
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
          <div className="mb-3">
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

          {/* Confirm Password */}
          <div className="mb-4">
            <label
              htmlFor="password_confirmation"
              className="form-label fw-semibold text-light"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="password_confirmation"
              className="form-control"
              placeholder="Re-enter password"
              value={form.password_confirmation}
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
            className="btn w-100 fw-bold register-btn"
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
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <p
          className="text-center mt-4 text-light"
          style={{ fontSize: "14px", opacity: "0.9" }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#6a7dff",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
