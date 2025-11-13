import Header from "./components/header";
import Footer from "./components/footer";

import {
  FaSatellite,
  FaMapMarkerAlt,
  FaHandshake,
  FaMap,
  FaUsers,
  FaGlobeAfrica,
} from "react-icons/fa";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";

export default function Home() {
  const { ref: mapRef, inView: mapInView } = useInView({ triggerOnce: true });
  const { ref: usersRef, inView: usersInView } = useInView({
    triggerOnce: true,
  });
  const { ref: regionRef, inView: regionInView } = useInView({
    triggerOnce: true,
  });

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="d-flex justify-content-center align-items-center mw-100 mt-5">
        <div className="container">
          <h1 className="text-center">
            Sudan’s Future <span className="text-primary">begins</span> with{" "}
            <br /> Hope and Determination
          </h1>
          <div className="container">
            <p className="text-center text-secondary" data-aos="fade-out">
              A <span className="text-primary">platform</span> to map
              war-affected areas, share local needs, and <br />
              guide recovery using citizen input, and real-time data.
            </p>
            <div className="container d-flex align-items-center justify-content-center mt-5">
              <Link to="/Map">
              <button type="submit" className="btn sucess py-3 fw-bold">
                View Interactive Map
              </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="container my-5 pt-5">
        <div className="row g-4 text-white">
          {[
            {
              icon: <FaSatellite size={50} />,
              title: "AI Satellite Insights",
              desc: "Analyze satellite images to assess damage & plan recovery.",
            },
            {
              icon: <FaMapMarkerAlt size={50} />,
              title: "Service Availability",
              desc: "Locate electricity, water, and medical access in real time.",
            },
            {
              icon: <FaHandshake size={50} />,
              title: "Local Initiatives",
              desc: "Highlight grassroots efforts, volunteer actions, and community-led recovery projects.",
            },
          ].map((card, idx) => (
            <div
              className="col-md-4"
              key={idx}
              data-aos="fade-up"
              data-aos-delay={idx * 300}
            >
              <div
                className="card rounded-4 p-4 text-center h-100 d-flex flex-column"
                style={{ minHeight: "400px" }}
              >
                <div className="icon-wrapper mx-auto mb-3">{card.icon}</div>
                <div className="flex-grow-1 d-flex flex-column justify-content-center">
                  <h5 className="fw-bold">{card.title}</h5>
                  <p className="text-secondary">{card.desc}</p>
                </div>
                <button className="btn btn-outline-primary mt-3">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Impact Section */}
<div className="parallax-effect">
  <section className="container my-5 text-white pt-5">
    <h2 className="text-center mb-5">
      Our <span className="text-primary">Impact</span>
    </h2>
    <div className="row text-center" data-aos="zoom-in">
      <div className="col-md-4 mb-4" ref={mapRef}>
        <div className="d-flex flex-column align-items-center">
          <FaMap size={70} className="text-primary mb-2" />
          {mapInView && (
            <div className="fw-bold fs-2 text-white">
              <CountUp end={124} duration={4} />
            </div>
          )}
          <p className="text-secondary mt-2">Areas Mapped</p>
        </div>
      </div>

      <div className="col-md-4 mb-4" ref={usersRef}>
        <div className="d-flex flex-column align-items-center">
          <FaUsers size={70} className="text-primary mb-2" />
          {usersInView && (
            <div className="fw-bold fs-2 text-white">
              <CountUp end={532} duration={4} />
            </div>
          )}
          <p className="text-secondary mt-2">Community Contributors</p>
        </div>
      </div>

      <div className="col-md-4 mb-4" ref={regionRef}>
        <div className="d-flex flex-column align-items-center">
          <FaGlobeAfrica size={70} className="text-primary mb-2" />
          {regionInView && (
            <div className="fw-bold fs-2 text-white">
              <CountUp end={14} duration={4} />
            </div>
          )}
          <p className="text-secondary mt-2">Regions Covered</p>
        </div>
      </div>
    </div>
  </section>
</div>

          {/* Key Features Section  */}
          <section className="container my-5 text-white pt-5">
  <h2 className="text-center mb-5">
    Platform <span className="text-primary">Features</span>
  </h2>
  <div className="row g-4">
    {[
      {
        title: "AI Damage Detection",
        desc: "Analyzes satellite images to detect infrastructure damage.",
        svg: <img src="/assets/svgs/metaverso-bro.svg" alt="AI Detection" />,
      },
      {
        title: "Interactive War Map",
        desc: "Displays affected areas and current service availability.",
        svg: <img src="/assets/svgs/Location.svg" alt="Interactive Map"/>,
      },
      {
        title: "Community Reports",
        desc: "Allows citizens to report needs and initiatives.",
        svg: <img src="/assets/svgs/reports.svg" alt="Community Reports"/>,
      },
      {
        title: "Voting System",
        desc: "Enables users to vote on most urgent needs.",
        svg: <img src="/assets/svgs/voting.svg" alt="Voting System"/>,
      },
      {
        title: "Recovery Dashboard",
        desc: "Visualizes progress in restoration and service delivery.",
        svg: <img src="/assets/svgs/dashboard.svg" alt="Dashbord" />,
      },
      {
        title: "Live Service Tracker",
        desc: "Tracks real-time availability of electricity, water, and health.",
        svg: <img src="/assets/svgs/track.svg" alt="Live Tracker" />,
      },
      {
        title: "NGO Coordination Panel",
        desc: "Helps NGOs organize and focus their recovery efforts.",
        svg: <img src="/assets/svgs/NGO-cordnations.svg" alt="NGOs coordnations"/>,
      },
      {
        title: "Digital Archive",
        desc: "Preserves history and citizen experiences digitally.",
        svg: <img src="/assets/svgs/Documents-pana.svg" alt="Digital Archive"/>
      },
    ].map((feature, idx) => (
      <div key={idx} className="col-md-3 col-sm-6 text-center" data-aos="fade-up" data-aos-delay={idx * 100}>
        <div className="feature-box mb-3 mx-auto">{feature.svg}</div>
        <h5 className="fw-bold mt-3">{feature.title}</h5>
        <p className="text-secondary">{feature.desc}</p>
      </div>
    ))}
  </div>
</section>

<section className="container my-5 pt-5">
  <div className="contribute-section">
    <div className="row align-items-center">
      {/* Left Side */}
      <div className="col-md-6 mb-4 mb-md-0 text-white">
        <h2 className="fw-bold mb-3">
          <span className="text-primary">Join</span> the Movement
        </h2>
        <p className="text-secondary mb-4 fs-5">
          Be the voice of your community. Report needs, highlight initiatives, and help shape the future of Sudan.
        </p>
        <a href="/contribute" className="btn sucess px-4 py-3 fs-5 rounded-4">
          Start Contributing
        </a>
      </div>

      {/* Right Side */}
      <div className="col-md-6 text-center">
        <img
          src="/assets/images/join-movment.png"
          alt="Contribute Illustration"
          className="img-fluid"
          style={{ maxHeight: "400px" }}
        />
      </div>
    </div>
  </div>
</section>

<section className="container my-5 py-5 text-white text-center">
  <h2 className="fw-bold mb-4">Stories from the Ground</h2>
  <p className="text-secondary mb-5 fs-5">Real voices, real impact. See how your neighbors are making a difference.</p>

  <div className="row">
    {[
      {
        name: "Muna from Nyala",
        story: "After the power went out for a week, I used the platform to report it. Two days later, volunteers arrived.",
      },
      {
        name: "Osman from El Fasher",
        story: "We had no access to water. I voted for it in the platform — our area became a priority for aid.",
      },
      {
        name: "Ahlam from Omdurman",
        story: "I shared our neighborhood’s initiative to clean the streets. Now we have weekly support from volunteers.",
      },
    ].map((s, i) => (
      <div className="col-md-4 mb-4" key={i}>
        <div className="card rounded-4 p-4 h-100 bg-dark bg-opacity-50 border-0 text-start">
          <h6 className="fw-bold text-primary mb-2">{s.name}</h6>
          <p className="text-secondary fst-italic">"{s.story}"</p>
        </div>
      </div>
    ))}
  </div>
    <Link to="/Stories">
  <button href="/stories" className="btn sucess mt-4 px-4 py-3 fs-5 rounded-4">
    View All Stories
  </button>
  </Link>
</section>




    <Footer/>

    </>
  );
}
