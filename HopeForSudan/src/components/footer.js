import { Link } from "react-router-dom";

export default function Footer() {
    return(
        <footer
  className="text-white pt-5 pb-3"
  style={{
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(12px)",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  }}
>
  <div className="container">
    <div className="row">
      {/* 1. Links */}
      <div className="col-md-4 mb-4">
        <h5 className="fw-bold mb-3">Explore</h5>
        <ul className="list-unstyled text-secondary">
          <li><a href="/" className="text-decoration-none text-secondary">Home</a></li>
          <li><a href="/features" className="text-decoration-none text-secondary">Platform Features</a></li>
          <li><a href="/impact" className="text-decoration-none text-secondary">Our Impact</a></li>
          <li><a href="/contribute" className="text-decoration-none text-secondary">Contribute Data</a></li>
          <li><a href="/stories" className="text-decoration-none text-secondary">Community Stories</a></li>
        </ul>
      </div>

      {/* 2. Logo & Info */}
      <div className="col-md-4 mb-4 text-center">
        <h4 className="text-primary fw-bold">Hope for Sudan</h4>
        <p className="text-secondary small">
          A digital initiative to rebuild war-affected communities through maps, data, and local voices.
        </p>
      </div>

      {/* 3. Donations */}
      <div className="col-md-4 mb-4 text-md-end">
        <h5 className="fw-bold mb-3">Support & Donations</h5>
        <ul className="list-unstyled text-secondary">
          <li><a href="/donate" className="text-decoration-none text-secondary">Make a Direct Donation</a></li>
          <li><a href="https://gofundme.com/sudan-recovery" target="_blank" className="text-decoration-none text-secondary">Support on GoFundMe</a></li>
          <li><a href="/contact" className="text-decoration-none text-secondary">Partner with Us</a></li>
        </ul>
        <p className="small text-secondary mt-3 mb-0">© 2025 Hope for Sudan. Built with purpose and hope.</p>
      </div>
    </div>
  </div>
</footer>







    );
}