import Header from "./components/header";
import Footer from "./components/footer";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import api from "./axiosConfig";
import {
  FaBolt,
  FaTint,
  FaClinicMedical,
  FaPhoneAlt,
  FaShieldAlt,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function ClickToSetMarker({ setLatLng }) {
  useMapEvents({
    click(e) {
      setLatLng([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

const SUDAN_STATES = [
  "Khartoum",
  "Gezira",
  "North Darfur",
  "South Darfur",
  "Blue Nile",
  "Red Sea",
  "River Nile",
  "White Nile",
  "Kassala",
  "Northern",
  "North Kordofan",
  "South Kordofan",
  "West Darfur",
  "Central Darfur",
  "East Darfur",
  "West Kordofan",
  "Sennar",
  "Al Qadarif",
];

const AREAS_BY_STATE = {
  Khartoum: ["Bahri", "Omdurman", "Khartoum", "Al Kalakla", "Al Shajara"],
  Gezira: ["Wad Madani", "Hantoub", "Al Managil"],
  "Blue Nile": ["Damazin", "Roseires"],
  "North Darfur": ["El Fasher", "Kutum", "Mellit"],
  "Red Sea": ["Port Sudan", "Sinkat", "Tokar"],
  "White Nile": ["Kosti", "Rabak", "Ad Doum"],
  "North Kordofan": ["El Obeid", "Bara", "Um Ruwaba"],
  "South Darfur": ["Nyala", "Kas", "Rehed Elberdi"],
  Kassala: ["Kassala", "New Halfa", "Aroma"],
  "River Nile": ["Atbara", "Shendi", "Ad Damer"],
  Northern: ["Dongola", "Merowe", "Wadi Halfa"],
  Sennar: ["Sennar", "Singaa", "Dindir"],
  "Al Qadarif": ["Al Qadarif City", "Fao", "Butana"],
};

export default function Report() {
  const { state } = useLocation();
const editing = !!state?.edit && !!state?.report;
const reportToEdit = state?.report || null;


  // Base form state
  const [form, setForm] = useState({
  stateName: reportToEdit?.state || state?.stateName || "",
  area: reportToEdit?.area || "",
  description: reportToEdit?.description || "",
});


  // Submission state
  const [submitting, setSubmitting] = useState(false);

  // Optional map coordinates selected by the user
  const [latLng, setLatLng] = useState(null);

  // Dynamic area list
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    if (form.stateName) {
      setAreas(AREAS_BY_STATE[form.stateName] || []);
    }
  }, [form.stateName]);

  // Service matrix definition (keys must match backend expectations)
  const SERVICE_LIST = [
    { key: "electricity", label: "Electricity", icon: <FaBolt className="me-2" /> },
    { key: "water", label: "Water", icon: <FaTint className="me-2" /> },
    { key: "health", label: "Health", icon: <FaClinicMedical className="me-2" /> },
    { key: "calls_internet", label: "Calls & Internet", icon: <FaPhoneAlt className="me-2" /> },
    { key: "security", label: "Security", icon: <FaShieldAlt className="me-2" /> },
  ];

  // Per-service user input
  const [services, setServices] = useState(() => {
  const base = SERVICE_LIST.reduce((acc, s) => {
    acc[s.key] = { level: "unknown", percent: 0, note: "" };
    return acc;
  }, {});

  if (reportToEdit && reportToEdit.services) {
    for (const key of Object.keys(reportToEdit.services)) {
      base[key] = {
        level: reportToEdit.services[key].level ?? "unknown",
        percent: reportToEdit.services[key].percent ?? 0,
        note: reportToEdit.services[key].note ?? "",
      };
    }
  }
  return base;
});


  // Update availability level for a service
  const setLevel = (key, level) => {
    setServices((prev) => {
      const next = { ...prev };
      next[key] = {
        ...next[key],
        level,
        percent: level === "outage" ? 0 : level === "ok" ? 100 : next[key].percent || 50,
      };
      return next;
    });
  };

  // Update percentage when in "partial" mode
  const setPercent = (key, value) => {
    setServices((prev) => {
      const next = { ...prev };
      next[key] = { ...next[key], percent: Number(value), level: "partial" };
      return next;
    });
  };

  // Update optional note for a service
  const setNote = (key, value) => {
    setServices((prev) => {
      const next = { ...prev };
      next[key] = { ...next[key], note: value };
      return next;
    });
  };

  // Update form + handle state selection (تعبئة المناطق)
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "stateName") {
      setForm((f) => ({ ...f, stateName: value, area: "" }));
      setAreas(AREAS_BY_STATE[value] || []);
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Submit payload to Laravel API (مع Bearer token)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const cleanedServices = Object.entries(services).reduce((acc, [k, v]) => {
      if (v.level !== "unknown" || v.note) acc[k] = v;
      return acc;
    }, {});

    const payload = {
      stateName: form.stateName,
      area: form.area,
      description: form.description,
      services: cleanedServices,
      lat: latLng ? latLng[0] : null,
      lng: latLng ? latLng[1] : null,
    };

   try {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("يرجى تسجيل الدخول أولاً.");
    return;
  }

  // 🔥 هنا التعديل الأساسي
  const url = editing
    ? `/reports/${reportToEdit.id}`   // PUT
    : `/reports`;                     // POST

  const method = editing ? "put" : "post";

  const response = await api({
    method,
    url,
    data: payload,
  });

  alert(editing ? "✅ Report updated successfully!" : "✅ Report submitted successfully!");

  console.log(response.data);

  // reset only if it's new report
  if (!editing) {
    setForm({ stateName: "", area: "", description: "" });
    setAreas([]);
    setServices(
      SERVICE_LIST.reduce((acc, s) => {
        acc[s.key] = { level: "unknown", percent: 0, note: "" };
        return acc;
      }, {})
    );
    setLatLng(null);
  }

} catch (error) {
      console.error("Server responded with:", error.response?.data || error.message);
      alert(error.response?.data?.message || "❌ Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <div className="container text-white my-4">
        <h3 className="mb-3">Report Your Area</h3>
        <p className="text-secondary">
          Tell us how available each service is in your area. You can adjust multiple services at once.
        </p>

        <form onSubmit={handleSubmit} className="row g-4">
          {/* State + Area */}
          <div className="col-md-4">
            <label className="form-label">State</label>
            <select
              name="stateName"
              className="form-select"
              value={form.stateName}
              onChange={handleChange}
              required
            >
              <option value="">Select State</option>
              {SUDAN_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="col-md-8">
            <label className="form-label">Area Details</label>
            {areas.length > 0 ? (
              <select
                name="area"
                className="form-select"
                value={form.area}
                onChange={handleChange}
                required
              >
                <option value="">Select Area</option>
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="area"
                className="form-control"
                value={form.area}
                onChange={handleChange}
                placeholder="Neighborhood / district"
                disabled
              />
            )}
          </div>

          {/* ===== Services Matrix ===== */}
          <div className="col-12">
            <label className="form-label d-block mb-2">Services Availability</label>

            <div className="row g-3">
              {SERVICE_LIST.map((s) => {
                const v = services[s.key];
                return (
                  <div key={s.key} className="col-lg-6">
                    <div
                      className="p-3 rounded-4"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center">
                          {s.icon}
                          <strong>{s.label}</strong>
                        </div>

                        {/* Three-state segmented control */}
                        <div className="btn-group" role="group" aria-label={`${s.label} level`}>
                          <input
                            type="radio"
                            className="btn-check"
                            name={`lvl-${s.key}`}
                            id={`out-${s.key}`}
                            checked={v.level === "outage"}
                            onChange={() => setLevel(s.key, "outage")}
                          />
                          <label className="btn btn-sm btn-outline-danger" htmlFor={`out-${s.key}`}>
                            Outage
                          </label>

                          <input
                            type="radio"
                            className="btn-check"
                            name={`lvl-${s.key}`}
                            id={`par-${s.key}`}
                            checked={v.level === "partial"}
                            onChange={() => setLevel(s.key, "partial")}
                          />
                          <label className="btn btn-sm btn-outline-warning" htmlFor={`par-${s.key}`}>
                            Partial
                          </label>

                          <input
                            type="radio"
                            className="btn-check"
                            name={`lvl-${s.key}`}
                            id={`ok-${s.key}`}
                            checked={v.level === "ok"}
                            onChange={() => setLevel(s.key, "ok")}
                          />
                          <label className="btn btn-sm btn-outline-success" htmlFor={`ok-${s.key}`}>
                            OK
                          </label>
                        </div>
                      </div>

                      {/* Slider shows only when "partial" */}
                      {v.level === "partial" && (
                        <div className="mb-2">
                          <input
                            type="range"
                            className="form-range"
                            min="0"
                            max="100"
                            step="5"
                            value={v.percent}
                            onChange={(e) => setPercent(s.key, e.target.value)}
                          />
                          <div className="d-flex justify-content-between">
                            <small className="text-secondary">0%</small>
                            <span className="badge bg-warning text-dark">{v.percent}%</span>
                            <small className="text-secondary">100%</small>
                          </div>
                        </div>
                      )}

                      {/* Quick badge for "ok" / "outage" */}
                      {v.level !== "partial" && v.level !== "unknown" && (
                        <div className="mb-2">
                          <span className={`badge ${v.level === "ok" ? "bg-success" : "bg-danger"}`}>
                            {v.level === "ok" ? "Fully Available" : "Outage"}
                          </span>
                        </div>
                      )}

                      {/* Optional note per service */}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Optional note (e.g., times, affected blocks...)"
                        value={v.note}
                        onChange={(e) => setNote(s.key, e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* ===== End Services Matrix ===== */}

          {/* General description */}
          <div className="col-12">
            <label className="form-label">General Notes (optional)</label>
            <textarea
              name="description"
              rows={3}
              className="form-control"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Anything else you'd like to add..."
            />
          </div>

          {/* Map */}
          <div className="col-12">
            <label className="form-label d-block">Select Location on Map</label>
            <div style={{ height: 280, borderRadius: 8, overflow: "hidden" }}>
              <MapContainer center={[15.5, 32.5]} zoom={6} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ClickToSetMarker setLatLng={setLatLng} />
                {latLng && <Marker position={latLng} icon={markerIcon} />}
              </MapContainer>
            </div>
          </div>

          {/* Actions */}
          <div className="col-12 d-flex gap-2 justify-content-end">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
            <a href="/Map" className="btn btn-secondary">Back to Map</a>
          </div>
        </form>
      </div>

      <Footer />
    </>
  );
}
