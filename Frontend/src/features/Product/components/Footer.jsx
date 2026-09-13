import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.scss";

export const Footer = () => {
  return (
    <footer className="nex-footer">
      <div className="nex-footer__container">
        <div className="nex-footer__grid">
          {/* Brand Col */}
          <div className="nex-footer__brand-col">
            <Link to="/" className="nex-footer__brand">
              <img src="/nexgear-logo.svg" alt="Nexgear" className="nex-footer__logo" />
              <span className="nex-footer__brand-text">Nexgear</span>
            </Link>
            <p className="nex-footer__tagline">
              Engineering professional-grade desk instruments. Uncompromising acoustics, precision CNC craftsmanship, and minimal aesthetics.
            </p>
            <span className="nex-footer__copy">
              &copy; {new Date().getFullYear()} Nexgear Technologies, Inc. All rights reserved.
            </span>
          </div>

          {/* Links 1 */}
          <div className="nex-footer__col">
            <h4 className="nex-footer__heading">Ecosystem</h4>
            <ul className="nex-footer__list">
              <li><Link to="/" className="nex-footer__link">Keyboards & Bases</Link></li>
              <li><Link to="/" className="nex-footer__link">Artisan Switches</Link></li>
              <li><Link to="/" className="nex-footer__link">Machined Keycaps</Link></li>
              <li><Link to="/" className="nex-footer__link">Custom Cables</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="nex-footer__col">
            <h4 className="nex-footer__heading">Portals</h4>
            <ul className="nex-footer__list">
              <li><Link to="/seller/dashboard" className="nex-footer__link">Seller Studio</Link></li>
              <li><Link to="/seller/products/create" className="nex-footer__link">Publish Instrument</Link></li>
              <li><Link to="/register" className="nex-footer__link">Create Account</Link></li>
              <li><Link to="/login" className="nex-footer__link">Sign In</Link></li>
            </ul>
          </div>

          {/* Engineering / Highlights */}
          <div className="nex-footer__col">
            <h4 className="nex-footer__heading">Standards</h4>
            <div className="nex-footer__badges">
              <div className="nex-footer__badge">CNC 6063 Aluminum</div>
              <div className="nex-footer__badge">Gasket Isolators</div>
              <div className="nex-footer__badge">1000Hz Polling</div>
              <div className="nex-footer__badge">Hot-Swappable PCB</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
