import Header from "./components/header";
import Footer from "./components/footer";
import {
  FaBolt,
  FaTint,
  FaClinicMedical,
  FaSchool,
  FaWifi,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaRegClock,
} from "react-icons/fa";
import { MapContainer, TileLayer } from "react-leaflet";

export default function RecoveryDashboard() {
  // Summary stats (dummy data for now)
  const summaryStats = {
    totalReports: 128,
    totalStories: 34,
    areasAssessed: 47,
    servicesRestored: 22,
  };

  // Services recovery status (dummy data)
  const serviceStatus = [
    {
      key: "electricity",
      label: "Electricity",
      icon: <FaBolt />,
      status: "Partial",
      percent: 60,
    },
    {
      key: "water",
      label: "Water",
      icon: <FaTint />,
      status: "Restored",
      percent: 90,
    },
    {
      key: "health",
      label: "Healthcare",
      icon: <FaClinicMedical />,
      status: "Critical",
      percent: 35,
    },
    {
      key: "schools",
      label: "Education",
      icon: <FaSchool />,
      status: "Partial",
      percent: 55,
    },
    {
      key: "internet",
      label: "Connectivity",
      icon: <FaWifi />,
      status: "Limited",
      percent: 40,
    },
    {
      key: "security",
      label: "Security",
      icon: <FaShieldAlt />,
      status: "Improving",
      percent: 70,
    },
  ];

  // Damage level per state (dummy data)
  const damageByState = [
    { state: "Khartoum", level: "High", reports: 34 },
    { state: "Darfur", level: "High", reports: 29 },
    { state: "Blue Nile", level: "Medium", reports: 18 },
    { state: "North Kordofan", level: "Medium", reports: 14 },
    { state: "Gezira", level: "Low", reports: 9 },
  ];

  // Latest updates feed (dummy data)
  const latestUpdates = [
    {
      id: 1,
      title: "Electricity restored in parts of Omdurman",
      time: "2 hours ago",
      tag: "Electricity",
    },
    {
      id: 2,
      title: "New medical camp added in Blue Nile region",
      time: "5 hours ago",
      tag: "Healthcare",
    },
    {
      id: 3,
      title: "Water network partially working in Khartoum North",
      time: "Yesterday",
      tag: "Water",
    },
    {
      id: 4,
      title: "Security checkpoints increased in North Kordofan",
      time: "2 days ago",
      tag: "Security",
    },
  ];

  // Shared glass style for cards
  const glassStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
  };

  return (
    <>
      <Header />
      <main className="py-5">
        <div className="container text-white">
          {/* Page Title */}
          <section className="mb-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h1 className="fw-bold">Recovery Dashboard</h1>
                <p className="text-secondary mb-0">
                  Monitor restoration progress, service availability, and
                  community recovery across Sudan.
                </p>
              </div>
              <div className="d-flex align-items-center gap-2 text-secondary">
                <FaRegClock />
                <span>Last sync: just now (demo data)</span>
              </div>
            </div>
          </section>

          {/* Top Summary Cards */}
          <section className="row g-4 mb-4">
            {/* Total Reports */}
            <div className="col-md-3 col-sm-6">
              <div
                className="p-4 rounded-4 h-100"
                style={glassStyle}
              >
                <p className="text-secondary mb-1">Total Reports</p>
                <h3 className="fw-bold">{summaryStats.totalReports}</h3>
                <p className="small text-secondary mb-0">
                  Citizen reports collected from the field.
                </p>
              </div>
            </div>

            {/* Total Stories */}
            <div className="col-md-3 col-sm-6">
              <div
                className="p-4 rounded-4 h-100"
                style={glassStyle}
              >
                <p className="text-secondary mb-1">Community Stories</p>
                <h3 className="fw-bold">{summaryStats.totalStories}</h3>
                <p className="small text-secondary mb-0">
                  Documented experiences and narratives.
                </p>
              </div>
            </div>

            {/* Areas Assessed */}
            <div className="col-md-3 col-sm-6">
              <div
                className="p-4 rounded-4 h-100"
                style={glassStyle}
              >
                <p className="text-secondary mb-1">Areas Assessed</p>
                <h3 className="fw-bold">{summaryStats.areasAssessed}</h3>
                <p className="small text-secondary mb-0">
                  Locations with collected data and mapping.
                </p>
              </div>
            </div>

            {/* Services Restored */}
            <div className="col-md-3 col-sm-6">
              <div
                className="p-4 rounded-4 h-100"
                style={glassStyle}
              >
                <p className="text-secondary mb-1">Services Restored</p>
                <h3 className="fw-bold">{summaryStats.servicesRestored}</h3>
                <p className="small text-secondary mb-0">
                  Key services back in operation.
                </p>
              </div>
            </div>
          </section>

          {/* Services Status Grid */}
          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0">Service Recovery Status</h4>
              <span className="text-secondary small">
                Based on latest validated reports
              </span>
            </div>

            <div className="row g-4">
              {serviceStatus.map((service) => (
                <div key={service.key} className="col-md-4 col-sm-6">
                  <div
                    className="p-4 rounded-4 h-100 d-flex flex-column"
                    style={glassStyle}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle"
                          style={{
                            width: "44px",
                            height: "44px",
                            background: "rgba(255, 255, 255, 0.06)",
                          }}
                        >
                          {service.icon}
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{service.label}</h6>
                          <small className="text-secondary">
                            Status: {service.status}
                          </small>
                        </div>
                      </div>
                      <span className="badge bg-primary">
                        {service.percent}%
                      </span>
                    </div>

                    <div className="progress" style={{ height: "8px" }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${service.percent}%` }}
                        aria-valuenow={service.percent}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>

                    <p className="small text-secondary mt-3 mb-0">
                      Progress towards full restoration based on collected data.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Damage + Mini Map Row */}
          <section className="row g-4 mb-5">
            {/* Damage by State */}
            <div className="col-lg-6">
              <div className="p-4 rounded-4 h-100" style={glassStyle}>
                <div className="d-flex align-items-center mb-3">
                  <FaMapMarkerAlt className="me-2" />
                  <h5 className="fw-bold mb-0">Damage Level by State</h5>
                </div>
                <p className="text-secondary small">
                  Overview of reported damage and recovery priority.
                </p>
                <div className="table-responsive mt-3">
                  <table className="table table-borderless align-middle text-white">
                    <thead>
                      <tr className="text-secondary small">
                        <th>State</th>
                        <th>Damage Level</th>
                        <th>Reports</th>
                      </tr>
                    </thead>
                    <tbody>
                      {damageByState.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.state}</td>
                          <td>
                            <span className="badge bg-danger-subtle text-white">
                              {row.level}
                            </span>
                          </td>
                          <td>{row.reports}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Mini Map */}
            <div className="col-lg-6">
              <div className="p-4 rounded-4 h-100" style={glassStyle}>
                <h5 className="fw-bold mb-3">Geospatial Overview</h5>
                <p className="text-secondary small">
                  Interactive map showing affected regions and focus areas.
                </p>
                <div className="rounded-4 overflow-hidden" style={{ height: "260px" }}>
                  <MapContainer
                    center={[15.5, 32.5]} // Approximate center of Sudan
                    zoom={5}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                  </MapContainer>
                </div>
              </div>
            </div>
          </section>

          {/* Latest Updates Feed */}
          <section className="mb-4">
            <div className="p-4 rounded-4" style={glassStyle}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Latest Recovery Updates</h5>
                <span className="text-secondary small">
                  Auto-generated from recent reports (demo)
                </span>
              </div>

              <div className="list-group list-group-flush">
                {latestUpdates.map((item) => (
                  <div
                    key={item.id}
                    className="list-group-item bg-transparent text-white px-0 d-flex justify-content-between align-items-start"
                    style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                  >
                    <div>
                      <h6 className="mb-1">{item.title}</h6>
                      <small className="text-secondary d-flex align-items-center gap-2">
                        <FaRegClock /> {item.time}
                      </small>
                    </div>
                    <span className="badge bg-secondary">{item.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
