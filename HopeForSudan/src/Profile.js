import { useEffect, useState } from "react";
import api from "./axiosConfig";
import Header from "./components/header";
import Footer from "./components/footer";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [pwForm, setPwForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [savingPw, setSavingPw] = useState(false);
  const [myReports, setMyReports] = useState([]);
  const navigate = useNavigate();

  // تحميل بيانات المستخدم والتقارير
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setProfile({ name: u.name, email: u.email });
      } catch {}
    }

    // fetch latest user
    api
      .get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile({ name: res.data.name, email: res.data.email });
        localStorage.setItem("user", JSON.stringify(res.data));
      })
      .catch(() => {});

    // fetch my reports
    api
      .get("/my-reports", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMyReports(res.data || []))
      .catch(() => {});
  }, [navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((p) => ({ ...p, [name]: value }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const token = localStorage.getItem("token");

    try {
      const res = await api.put("/user", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("✅ Profile updated");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("❌ Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    const token = localStorage.getItem("token");

    try {
      await api.put("/user/password", pwForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Password updated");
      setPwForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("❌ Failed to update password");
    } finally {
      setSavingPw(false);
    }
  };

  const handleEditReport = (report) => {
    // نمشي لصفحة التقارير ونرسل التقرير في state
    navigate("/Reports", {
      state: {
        edit: true,
        report,
      },
    });
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    const token = localStorage.getItem("token");
    try {
      await api.delete(`/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyReports((list) => list.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("❌ Failed to delete report");
    }
  };

  return (
    <>
      <Header />

      <div className="container text-white my-4">
        <div className="row g-4">
          {/* Profile info */}
          <div className="col-lg-6">
            <div
              className="p-4 rounded-4"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h4 className="mb-3">Profile</h4>
              <form onSubmit={saveProfile}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingProfile}
                >
                  {savingProfile ? "Saving..." : "Save changes"}
                </button>
              </form>
            </div>
          </div>

          {/* Password change */}
          <div className="col-lg-6">
            <div
              className="p-4 rounded-4"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h4 className="mb-3">Change Password</h4>
              <form onSubmit={savePassword}>
                <div className="mb-3">
                  <label className="form-label">Current password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="current_password"
                    value={pwForm.current_password}
                    onChange={handlePwChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">New password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={pwForm.password}
                    onChange={handlePwChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm new password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password_confirmation"
                    value={pwForm.password_confirmation}
                    onChange={handlePwChange}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-outline-light"
                  disabled={savingPw}
                >
                  {savingPw ? "Saving..." : "Update password"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* My reports list */}
        <div className="mt-5">
          <h4 className="mb-3">My Reports</h4>
          {myReports.length === 0 && (
            <p className="text-secondary">You haven't submitted any reports yet.</p>
          )}

          {myReports.length > 0 && (
            <div className="table-responsive">
              <table className="table table-dark table-striped align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>State</th>
                    <th>Area</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {myReports.map((r, idx) => (
                    <tr key={r.id}>
                      <td>{idx + 1}</td>
                      <td>{r.state}</td>
                      <td>{r.area}</td>
                      <td>{new Date(r.created_at).toLocaleString()}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEditReport(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteReport(r.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
