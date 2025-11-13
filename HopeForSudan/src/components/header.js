import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // اقرأ التوكن وبيانات المستخدم من localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // إقفال منيو البروفايل لو ضغطنا برة
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setShowProfileMenu(false);
    navigate("/login");
  };

  const handleGoProfile = () => {
    setShowProfileMenu(false);
    navigate("/profile");
  };

  const firstLetter = (user?.name || "U").charAt(0).toUpperCase();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/home">
          Hope For Sudan
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {/* لو ما داخل، أظهر أزرار Login / Sign Up زي زمان */}
            {!isLoggedIn && (
              <>
                <li className="nav-item me-2">
                  <Link className="nav-link" to="/login">
                    <button type="button" className="btn py-3 fw-bold">
                      Log In
                    </button>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    <button
                      type="button"
                      className="btn btn-outline-primary py-3 fw-bold"
                    >
                      Sign Up
                    </button>
                  </Link>
                </li>
              </>
            )}

            {/* لو داخل، أظهر أيقونة البروفايل مع منيو منسدلة */}
            {isLoggedIn && (
              <li className="nav-item position-relative" ref={profileRef}>
                <button
                  type="button"
                  className="btn d-flex align-items-center gap-2"
                  onClick={() => setShowProfileMenu((v) => !v)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#fff",
                  }}
                >
                  {/* دائرة البروفايل */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #2f27ce, #5f4ff8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    {firstLetter}
                  </div>
                  {/* الاسم يظهر من الشاشات المتوسطة وطالع بس */}
                  <div className="d-none d-md-flex flex-column text-start">
                    <span style={{ fontSize: "0.85rem" }}>Logged in as</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                      {user?.name || "User"}
                    </span>
                  </div>
                  <span className="d-none d-md-inline ms-1" style={{ fontSize: 12 }}>
                    ▾
                  </span>
                </button>

                {showProfileMenu && (
                  <div
                    className="shadow-sm"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "110%",
                      minWidth: "220px",
                      backgroundColor: "#020423",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      zIndex: 2000,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 14px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        Signed in as
                      </div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                        {user?.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(255,255,255,0.6)",
                          wordBreak: "break-all",
                        }}
                      >
                        {user?.email}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoProfile}
                      className="w-100 text-start"
                      style={{
                        padding: "10px 14px",
                        background: "transparent",
                        border: "none",
                        color: "#ffffff",
                        fontSize: "0.9rem",
                      }}
                    >
                      🧾 Profile
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-100 text-start"
                      style={{
                        padding: "10px 14px",
                        background: "transparent",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        borderBottom: "none",
                        borderLeft: "none",
                        borderRight: "none",
                        color: "#ff6b6b",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      ⏻ Log out
                    </button>
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
