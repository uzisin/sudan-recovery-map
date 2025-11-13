import Header from "./components/header";
import Footer from "./components/footer";
import { useState, useRef, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import sudanStates from "./sudan_states.json";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import axios from "axios";
import SudanMapSVG from "./assets/svgs/sudan.svg";

// demo icons
const electricityIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854866.png",
  iconSize: [25, 25],
});
const waterIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/728/728093.png",
  iconSize: [25, 25],
});

// demo markers
const markersData = [
  { type: "electricity", position: [15.55, 32.53], name: "Khartoum Power Station" },
  { type: "water", position: [14.5, 33.3], name: "Gezira Water Facility" },
  { type: "water", position: [13.6, 25.3], name: "Darfur Water Facility" },
];

// color scale
function getColor(percent) {
  if (percent == null) return "#6c757d"; // gray for no data
  return percent > 80
    ? "#006400"
    : percent > 60
    ? "#32CD32"
    : percent > 40
    ? "#FFFF00"
    : percent > 20
    ? "#FFA500"
    : "#8B0000";
}

// === Canonical helpers ===
const canonical = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]/g, "");

const normalizeStateKey = (raw) => {
  let k = canonical(raw);
  const alias = {
    gedaref: "alqadarif",
    algadaref: "alqadarif",
    algadarif: "alqadarif",
    gaderif: "alqadarif",
    gederaf: "alqadarif",
  };
  return alias[k] || k;
};

// map defaults
const initialCenter = [15.5, 32.5];
const initialZoom = 5;


export default function MapWithSmoothSidebar() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [reportData, setReportData] = useState([]); // holds full API data (states + areas)

  const [showMarkers, setShowMarkers] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  const [selectedState, setSelectedState] = useState(null); // { name, percent, breakdown, count, areas }
  const [selectedArea, setSelectedArea] = useState(null);

  const prevLayerRef = useRef(null);
  const mapRef = useRef();

  // state from API (keyed by canonical state_key)
  const [availability, setAvailability] = useState({});
  const [breakdownMap, setBreakdownMap] = useState({});
  const [reportsCount, setReportsCount] = useState({});
  const [displayNames, setDisplayNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showLoader, setShowLoader] = useState(true);

  // layers control
  const [activeService, setActiveService] = useState("overall");


  // strong normalizer for per-service averages
  const normalizeAvg = (raw) => {
    if (!raw) return null;

    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch {
        return null;
      }
    }

    const aliasMap = {
      electricity: "electricity",
      power: "electricity",
      water: "water",
      health: "health",
      medical: "health",
      healthcare: "health",
      calls_internet: "calls_internet",
      "calls & internet": "calls_internet",
      "calls-and-internet": "calls_internet",
      telecom: "calls_internet",
      internet: "calls_internet",
      network: "calls_internet",
      security: "security",
      safety: "security",
      police: "security",
    };

    const allowed = ["electricity", "water", "health", "calls_internet", "security"];
    const out = {};

    if (Array.isArray(raw)) {
      raw.forEach((item) => {
        if (Array.isArray(item) && item.length >= 2) {
          const k = String(item[0] ?? "").toLowerCase().trim();
          const v = Number(item[1]) || 0;
          const nk = aliasMap[k] || k;
          if (allowed.includes(nk)) out[nk] = v;
        } else if (item && typeof item === "object") {
          const k0 = String(item.key ?? item.name ?? item.service ?? "").toLowerCase().trim();
          const v0 = Number(item.value ?? item.avg ?? item.percent ?? item.percentage ?? 0) || 0;
          const nk = aliasMap[k0] || k0;
          if (allowed.includes(nk)) out[nk] = v0;
        }
      });
      return Object.keys(out).length ? out : null;
    }

    if (typeof raw === "object") {
      for (const k of Object.keys(raw)) {
        const k0 = String(k).toLowerCase().trim();
        const nk = aliasMap[k0] || k0;
        if (!allowed.includes(nk)) continue;
        const val = raw[k];
        const v = Number(typeof val === "string" ? val.trim().replace("%", "") : val) || 0;
        out[nk] = v;
      }
      return Object.keys(out).length ? out : null;
    }

    return null;
  };

  // fetch API (state aggregates + areas)
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get("http://127.0.0.1:8000/api/reports");

        const avail = {};
        const bmap = {};
        const rcount = {};
        const dnames = {};

        (Array.isArray(data) ? data : []).forEach((row) => {
          const key = normalizeStateKey(row.state_key || row.state);
          const norm = normalizeAvg(row.avg_services); // null or object

          dnames[key] = row.state; // pretty display
          bmap[key] = norm;

          if (norm) {
            const vals = Object.values(norm)
              .map((n) => Number(n) || 0)
              .filter((n) => n >= 0 && n <= 100);
            avail[key] = vals.length
              ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
              : null;
          } else {
            avail[key] = null;
          }

          rcount[key] = Number(row.reports_count ?? 0);
        });

        setAvailability(avail);
        setBreakdownMap(bmap);
        setReportsCount(rcount);
        setDisplayNames(dnames);
        setReportData(data); // store the raw API data (includes areas if controller returns them)
      } catch (e) {
        console.error("Failed to fetch reports:", e);
      } finally {
  setTimeout(() => {
    setLoading(false);
  }, 2500);
}

    };

    load();
  }, []);

 

useEffect(() => {
  let p = 0;
  const interval = setInterval(() => {
    p += 5;
    if (p <= 100) {
      setProgress(p);
    } else {
      clearInterval(interval);
      setTimeout(() => setShowLoader(false), 400); // fade-out
    }
  }, 100);
  return () => clearInterval(interval);
}, []);
 

  // force GeoJSON to re-render after availability/metric changes
  const geojsonKey = useMemo(() => {
    const keys = Object.keys(availability).sort();
    const sig = keys.map((k) => `${k}:${availability[k] ?? "null"}`).join("|");
    return `geojson-${sig}-${activeService}`;
  }, [availability, activeService]);

  // style by availability/metric
  function styleFactory(feature) {
    const name = feature.properties.name;
    const key = normalizeStateKey(name);

    let percent = null;
    if (activeService === "overall") {
      percent = availability[key] ?? null;
    } else {
      const breakdown = breakdownMap[key] || null;
      percent =
        breakdown && typeof breakdown[activeService] !== "undefined"
          ? Math.round(Number(breakdown[activeService] || 0))
          : null;
    }

    return {
      fillColor: getColor(percent),
      weight: 2,
      opacity: 1,
      color: "white",
      fillOpacity: 0.7,
    };
  }

  // zoom controls
  const zoomIn = () => {
    const map = mapRef.current;
    if (map) map.setZoom(map.getZoom() + 1);
  };
  const zoomOut = () => {
    const map = mapRef.current;
    if (map) map.setZoom(map.getZoom() - 1);
  };

  // reset view + selection
  const resetPrevLayerStyle = () => {
    if (prevLayerRef.current) {
      const layer = prevLayerRef.current;
      const feat = layer.feature;
      layer.setStyle(styleFactory(feat));
      prevLayerRef.current = null;
    }
  };

  const clearSelection = () => {
    resetPrevLayerStyle();
    setSelectedState(null);
    setSelectedArea(null);
  };

  const resetView = () => {
    const map = mapRef.current;
    if (map) map.setView(initialCenter, initialZoom);
    clearSelection();
  };

  // per-state interactions
  const handleEachFeature = (feature, layer) => {
    const displayName = feature.properties.name;

    layer.on({
      click: () => {
        layer.closePopup();
        resetPrevLayerStyle();
        layer.setStyle({ weight: 3, color: "#0d6efd", fillOpacity: 0.85 });
        prevLayerRef.current = layer;

        const map = mapRef.current;
        if (map && layer.getBounds) {
          map.fitBounds(layer.getBounds(), { padding: [40, 40] });
        }

        const key = normalizeStateKey(displayName);
        const breakdown = breakdownMap[key] ?? null;

        const stateData = (reportData || []).find(
          (d) => normalizeStateKey(d.state_key || d.state) === key
        );

        setSelectedState({
          name: displayNames[key] || displayName,
          percent: availability[key] ?? null,
          breakdown,
          count: reportsCount[key] ?? 0,
          areas: stateData?.areas || [],
        });

        setSelectedArea(null);
      },
    });
  };

  // safe breakdown numbers for right panel (not strictly needed but kept)
  const b = selectedState?.breakdown || {};
  const el = Math.round(Number(b.electricity ?? 0));
  const wa = Math.round(Number(b.water ?? 0));
  const he = Math.round(Number(b.health ?? 0));
  const net = Math.round(Number(b.calls_internet ?? 0));
  const sec = Math.round(Number(b.security ?? 0));

  return (
    <>
      <Header />

      <div style={{ position: "relative", height: "80vh" }}>
        {/* left sidebar */}
        <div className={`left-sidebar ${showSidebar ? "open" : "closed"}`}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-primary mb-0">⚡ Layers</h5>
            <button className="btn btn-sm btn-outline-light" onClick={() => setShowSidebar(false)}>
              ❌
            </button>
          </div>

          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="chkMarkers"
              checked={showMarkers}
              onChange={() => setShowMarkers((v) => !v)}
            />
            <label className="form-check-label ms-2" htmlFor="chkMarkers">
              <span className="badge bg-primary">Show demo markers</span>
            </label>
          </div>

          <small className="text-muted d-block">
            * Colors = real averages from citizen reports (API).
          </small>

          <hr className="border-secondary my-3" />
          <h6 className="text-light mb-2">Color by</h6>

          <select
            className="form-select form-select-sm mb-2"
            value={activeService}
            onChange={(e) => setActiveService(e.target.value)}
          >
            <option value="overall">Overall Availability</option>
            <option value="electricity">⚡ Electricity</option>
            <option value="water">💧 Water</option>
            <option value="health">🏥 Health</option>
            <option value="calls_internet">🌐 Internet</option>
            <option value="security">🛡 Security</option>
          </select>
          <small className="text-muted d-block mb-2">Select which metric colors the map.</small>
          </div>
          

        {/* mini sidebar */}
        {!showSidebar && (
          <div className="mini-sidebar bg-primary text-white">
            <button className="btn btn-outline-light btn-sm mb-2" onClick={() => setShowSidebar(true)} title="Open layers">
              ☰
            </button>
            <button className="btn btn-outline-light btn-sm mb-2" onClick={zoomIn} title="Zoom in">
              ＋
            </button>
            <button className="btn btn-outline-light btn-sm mb-2" onClick={zoomOut} title="Zoom out">
              －
            </button>
            <button
              className="btn btn-outline-light btn-sm mb-2"
              onClick={() => setShowLegend((v) => !v)}
              title={showLegend ? "Hide legend" : "Show legend"}
            >
              🏷
            </button>
            <button className="btn btn-outline-light btn-sm" onClick={resetView} title="Reset view">
              ⤺
            </button>
          </div>
        )}

        {/* map */}
       <MapContainer
  center={initialCenter}
  zoom={initialZoom}
  style={{ height: "100%", width: "100%" }}
  whenCreated={(mapInstance) => {
    mapRef.current = mapInstance;
  }}
>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution="&copy; OpenStreetMap contributors"
  />


  <GeoJSON
    key={geojsonKey}
    data={sudanStates}
    style={styleFactory}
    onEachFeature={handleEachFeature}
  />

          {showMarkers &&
            markersData.map((marker, idx) => (
              <Marker key={idx} position={marker.position} icon={marker.type === "electricity" ? electricityIcon : waterIcon}>
                <Popup>{marker.name}</Popup>
              </Marker>
            ))}
        </MapContainer>

        {/* loading overlay */}
{showLoader && (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "radial-gradient(circle at center, #000216 60%, #000010 100%)",
      zIndex: 3000,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#00ff99",
      fontFamily: "Poppins, sans-serif",
      transition: "opacity 0.8s ease",
      opacity: progress < 100 ? 1 : 0,
    }}
  >
    <div
      style={{
        position: "relative",
        width: "240px",
        height: "240px",
        mask: `url(${SudanMapSVG}) center / contain no-repeat`,
        WebkitMask: `url(${SudanMapSVG}) center / contain no-repeat`,
        background: `linear-gradient(to top, #00ff99 ${progress}%, rgba(0,255,153,0.05) ${progress}%)`,
        filter: "drop-shadow(0 0 10px #00ff99)",
        transition: "background 0.3s linear",
      }}
    ></div>

    <div style={{ marginTop: "20px", fontSize: "1.2rem", textAlign: "center" }}>
      <strong>Loading Sudan Recovery Map…</strong>
      <div style={{ fontSize: "1rem", marginTop: "6px" }}>{progress}%</div>
    </div>
  </div>
)}

        {/* legend */}
        {showLegend && (
          <div
            className="map-legend"
            style={{
              position: "absolute",
              bottom: 12,
              right: selectedState ? 360 : 12,
              zIndex: 1300,
              maxWidth: 280,
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <strong>Legend</strong>
            </div>

            <div className="mb-2">
              <div className="small text-secondary mb-1">Service availability</div>
              <div className="d-flex flex-column gap-1">
                <div className="d-flex align-items-center">
                  <span className="swatch" style={{ background: "#006400" }}></span>
                  <span className="ms-2">81–100% (Excellent)</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="swatch" style={{ background: "#32CD32" }}></span>
                  <span className="ms-2">61–80% (Good)</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="swatch" style={{ background: "#FFFF00" }}></span>
                  <span className="ms-2">41–60% (Moderate)</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="swatch" style={{ background: "#FFA500" }}></span>
                  <span className="ms-2">21–40% (Low)</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="swatch" style={{ background: "#8B0000" }}></span>
                  <span className="ms-2">0–20% (Critical)</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="swatch" style={{ background: "#6c757d" }}></span>
                  <span className="ms-2">No reports yet</span>
                </div>
              </div>
            </div>

            <hr className="border-secondary my-2" />

            <div>
              <div className="small text-secondary mb-1">Map markers</div>
              <div className="d-flex flex-column gap-1">
                <div className="d-flex align-items-center">
                  <img src="https://cdn-icons-png.flaticon.com/512/854/854866.png" alt="Electricity" width="16" height="16" />
                  <span className="ms-2">Electricity site</span>
                </div>
                <div className="d-flex align-items-center">
                  <img src="https://cdn-icons-png.flaticon.com/512/728/728093.png" alt="Water" width="16" height="16" />
                  <span className="ms-2">Water facility</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* right details panel */}
        <div
          className={`right-sidebar ${selectedState ? "open" : "closed"}`}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: selectedState ? "340px" : "0",
            overflowY: "auto",
            overflowX: "hidden",
            background: "linear-gradient(rgb(28, 31, 71))",
            color: "#fff",
            padding: selectedState ? "16px" : "0",
            zIndex: 1150,
            transition: "all 0.3s ease-in-out",
            borderLeft: selectedState ? "1px solid rgba(255,255,255,0.1)" : "none",
          }}
        >
          {selectedState && (
            <>
              {/* --- Header --- */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">{selectedState.name}</h5>
                <button className="btn btn-sm btn-outline-light" onClick={clearSelection}>
                  ✖
                </button>
              </div>

              {/* --- Overall availability --- */}
              <p className="mb-1">Overall Service Availability</p>
              {selectedState.percent != null ? (
                <div className="progress mb-2" role="progressbar" aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className={`progress-bar ${
                      selectedState.percent >= 60 ? "bg-success" : selectedState.percent >= 40 ? "bg-warning" : "bg-danger"
                    }`}
                    style={{ width: `${selectedState.percent}%` }}
                  >
                    {selectedState.percent}%
                  </div>
                </div>
              ) : (
                <span className="badge bg-secondary mb-2">No reports yet</span>
              )}

              <small className="text-muted d-block mb-3">Reports count: {selectedState.count ?? 0}</small>

              {/* --- Services Breakdown (keep your colors) --- */}
              <h6 className="mt-3">Services Breakdown</h6>
              {selectedState.breakdown ? (
                <>
                  <p className="mb-1">⚡ Electricity</p>
                  <div className="progress mb-2">
                    <div className="progress-bar bg-success" style={{ width: `${el}%` }}>
                      {el}%
                    </div>
                  </div>

                  <p className="mb-1">💧 Water</p>
                  <div className="progress mb-2">
                    <div className="progress-bar bg-info" style={{ width: `${wa}%` }}>
                      {wa}%
                    </div>
                  </div>

                  <p className="mb-1">🏥 Health</p>
                  <div className="progress mb-2">
                    <div className="progress-bar bg-danger" style={{ width: `${he}%` }}>
                      {he}%
                    </div>
                  </div>

                  <p className="mb-1">📶 Calls & Internet</p>
                  <div className="progress mb-2">
                    <div className="progress-bar bg-primary" style={{ width: `${net}%` }}>
                      {net}%
                    </div>
                  </div>

                  <p className="mb-1">🛡 Security</p>
                  <div className="progress mb-3">
                    <div className="progress-bar" style={{ width: `${sec}%`, backgroundColor: "#a46000ff" }}>
                      {sec}%
                    </div>
                  </div>
                </>
              ) : (
                <small className="text-muted">No per-service data for this state yet.</small>
              )}

              {/* --- Area selection --- */}
              {selectedState.areas && selectedState.areas.length > 0 && (
                <>
                  <hr className="my-3" />
                  <h6 className="mb-2 text-info">Select Area</h6>
                  <select className="form-select mb-3" value={selectedArea || ""} onChange={(e) => setSelectedArea(e.target.value)}>
                    <option value="">-- Choose an area --</option>
                    {selectedState.areas.map((a, i) => (
                      <option key={i} value={a.area}>
                        {a.area}
                      </option>
                    ))}
                  </select>

                  {selectedArea && (() => {
                    const areaObj = selectedState.areas.find((a) => a.area === selectedArea);
                    if (!areaObj) return null;
                    const s = areaObj.avg_services || {};
                    return (
                      <div
                        className="p-3 rounded-3"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <strong>{areaObj.area}</strong>
                        <p className="small text-secondary mb-1">Reports: {areaObj.reports_count}</p>
                        <ul className="list-unstyled small mb-0">
                          <li>⚡ Electricity: {s.electricity ?? 0}%</li>
                          <li>💧 Water: {s.water ?? 0}%</li>
                          <li>🏥 Health: {s.health ?? 0}%</li>
                          <li>🌐 Internet: {s.calls_internet ?? 0}%</li>
                          <li>🛡️ Security: {s.security ?? 0}%</li>
                        </ul>
                      </div>
                    );
                  })()}
                </>
              )}

              <Link to="/reports">
                <div className="d-grid gap-2 mt-3">
                  <button className="btn btn-primary btn-sm">Report Your Area</button>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
