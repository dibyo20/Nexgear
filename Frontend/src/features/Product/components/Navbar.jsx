import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hook/useAuth.js";
import { useCart } from "../../cart/hooks/useCart.js";
import { BoxIcon, PlusIcon, LogoutIcon, UserIcon, CartIcon } from "./Icons.jsx";
import "../styles/Navbar.scss";

export const Navbar = () => {
  const { user, handleLogout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const onLogout = async () => {
    await handleLogout();
    navigate("/login");
  };

  return (
    <header className="nex-navbar">
      <div className="nex-navbar__container">
        {/* Brand */}
        <Link to={user ? (user.role === "seller" ? "/seller/dashboard" : "/home") : "/"} className="nex-navbar__brand" aria-label="Nexgear Home">
          <img src="/nexgear-logo.svg" alt="Nexgear" className="nex-navbar__logo" />
          <span className="nex-navbar__brand-name">Nexgear</span>
          <span className="nex-navbar__brand-badge">STUDIO</span>
        </Link>

        {/* Navigation Links */}
        {user?.role === "seller" && (
          <nav className="nex-navbar__nav">
            <NavLink
              to="/seller/dashboard"
              className={({ isActive }) =>
                `nex-navbar__link ${isActive ? "nex-navbar__link--active" : ""}`
              }
            >
              <BoxIcon size={16} />
              <span>Seller Portal</span>
            </NavLink>
            <NavLink
              to="/seller/products/create"
              className={({ isActive }) =>
                `nex-navbar__link ${isActive ? "nex-navbar__link--active" : ""}`
              }
            >
              <PlusIcon size={16} />
              <span>New Listing</span>
            </NavLink>
          </nav>
        )}

        {/* Actions / Auth / Cart */}
        <div className="nex-navbar__actions">
          {/* Cart Icon Link */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `nex-navbar__cart-btn ${isActive ? "nex-navbar__cart-btn--active" : ""}`
            }
            title="Shopping Cart"
            aria-label="Shopping Cart"
          >
            <CartIcon size={19} />
            {cartCount > 0 && (
              <span className="nex-cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
            )}
          </NavLink>

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
