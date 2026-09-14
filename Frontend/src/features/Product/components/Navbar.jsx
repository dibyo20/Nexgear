import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hook/useAuth.js";
import { BoxIcon, PlusIcon, LogoutIcon, UserIcon } from "./Icons.jsx";
import "../styles/Navbar.scss";

export const Navbar = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await handleLogout();
    navigate("/login");
  };

  return (
    <header className="nex-navbar">
      <div className="nex-navbar__container">
        {/* Brand */}
        <Link to={user ? "/home" : "/"} className="nex-navbar__brand" aria-label="Nexgear Home">
          <img src="/nexgear-logo.svg" alt="Nexgear" className="nex-navbar__logo" />
          <span className="nex-navbar__brand-name">Nexgear</span>
          <span className="nex-navbar__brand-badge">STUDIO</span>
        </Link>

        {/* Navigation Links */}
        {user?.role === "seller" && (
          <nav className="nex-navbar__nav">
            <Link to="/seller/dashboard" className="nex-navbar__link nex-navbar__link--seller">
              <BoxIcon size={16} />
              <span>Seller Portal</span>
            </Link>
            <Link to="/seller/products/create" className="nex-navbar__link nex-navbar__link--seller">
              <PlusIcon size={16} />
              <span>New Listing</span>
            </Link>
          </nav>
        )}

        {/* Actions / Auth */}
        <div className="nex-navbar__actions">
          {user ? (
            <div className="nex-navbar__user-menu">
              <div className="nex-navbar__user-info">
                <div className="nex-navbar__avatar">
                  <UserIcon size={16} />
                </div>
                <div className="nex-navbar__user-details">
                  <span className="nex-navbar__user-name">{user.fullname}</span>
                  <span className={`nex-navbar__role-badge nex-navbar__role-badge--${user.role}`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="nex-navbar__logout-btn"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogoutIcon size={16} />
                <span className="nex-navbar__logout-text">Logout</span>
              </button>
            </div>
          ) : (
            <div className="nex-navbar__auth-links">
              <Link to="/login" className="nex-navbar__btn-login">
                Sign In
              </Link>
              <Link to="/register" className="nex-navbar__btn-register">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
