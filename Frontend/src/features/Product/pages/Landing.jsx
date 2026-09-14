import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useProduct } from "../hooks/useProduct.js";
import { useAuth } from "../../auth/hook/useAuth.js";
import {
  SearchIcon,
  SparklesIcon,
  ShieldIcon,
  LayersIcon,
  BoxIcon,
  ArrowRightIcon,
} from "../components/Icons.jsx";
import "../styles/Landing.scss";

export const Landing = () => {
  const navigate = useNavigate();
  const { products, loading, handleGetAllProducts } = useProduct();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      if (user.role === "seller") {
        navigate("/seller/dashboard", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    handleGetAllProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="nex-landing">
      <Navbar />

      <main className="nex-landing__main">
        {/* Hero Section */}
        <section className="nex-hero">
          <div className="nex-hero__bg-glow" />
          <div className="nex-hero__container">
            <div className="nex-hero__badge">
              <SparklesIcon size={14} />
              <span>Nexgear Studio Architecture</span>
            </div>

            <h1 className="nex-hero__title">
              Precision in every <span className="text-gradient">keystroke.</span>
            </h1>

            <p className="nex-hero__subtitle">
              Engineered with aerospace-grade 6063 aluminum, customized acoustic isolation,
              and hot-swappable PCB platforms. Designed for engineers and creators.
            </p>

            <div className="nex-hero__cta-group">
              <a href="#catalog" className="nex-hero__btn-primary">
                <span>Browse Instruments</span>
                <ArrowRightIcon size={16} />
              </a>

              {user?.role === "seller" ? (
                <Link to="/seller/products/create" className="nex-hero__btn-secondary">
                  <BoxIcon size={16} />
                  <span>Publish New Product</span>
                </Link>
              ) : user ? (
                <Link to="/home" className="nex-hero__btn-secondary">
                  <span>Enter Studio</span>
                </Link>
              ) : (
                <Link to="/register" className="nex-hero__btn-secondary">
                  <span>Join Nexgear</span>
                </Link>
              )}
            </div>

            {/* Hardware Specs Highlight Ribbon */}
            <div className="nex-hero__specs-bar">
              <div className="nex-hero__spec-item">
                <span className="nex-hero__spec-val">1000Hz</span>
                <span className="nex-hero__spec-label">Polling Rate</span>
              </div>
              <div className="nex-hero__spec-divider" />
              <div className="nex-hero__spec-item">
                <span className="nex-hero__spec-val">6063</span>
                <span className="nex-hero__spec-label">Anodized Alloy</span>
              </div>
              <div className="nex-hero__spec-divider" />
              <div className="nex-hero__spec-item">
                <span className="nex-hero__spec-val">5-Layer</span>
                <span className="nex-hero__spec-label">Acoustic Dampening</span>
              </div>
              <div className="nex-hero__spec-divider" />
              <div className="nex-hero__spec-item">
                <span className="nex-hero__spec-val">Hot-Swap</span>
                <span className="nex-hero__spec-label">Universal Sockets</span>
              </div>
            </div>
          </div>
        </section>

        {/* Engineering Pillars */}
        <section className="nex-pillars">
          <div className="nex-pillars__container">
            <div className="nex-pillar-card">
              <div className="nex-pillar-card__icon">
                <ShieldIcon size={22} />
              </div>
              <h3 className="nex-pillar-card__title">Solid CNC Machining</h3>
              <p className="nex-pillar-card__desc">
                Precision cut from single blocks of aluminum with bead-blasted and anodized finishes.
              </p>
            </div>

            <div className="nex-pillar-card">
              <div className="nex-pillar-card__icon">
                <LayersIcon size={22} />
              </div>
              <h3 className="nex-pillar-card__title">Gasket Suspension</h3>
              <p className="nex-pillar-card__desc">
                Custom silicone and poron isolators deliver a cushioned typing experience and deep sound profile.
              </p>
            </div>

            <div className="nex-pillar-card">
              <div className="nex-pillar-card__icon">
                <BoxIcon size={22} />
              </div>
              <h3 className="nex-pillar-card__title">Curated Marketplace</h3>
              <p className="nex-pillar-card__desc">
                Verified artisan makers and custom mechanical components, backed by authentic warranty.
              </p>
            </div>
          </div>
        </section>

        {/* Product Catalog Section */}
        <section id="catalog" className="nex-catalog">
          <div className="nex-catalog__container">
            <div className="nex-catalog__header">
              <div className="nex-catalog__titles">
                <span className="nex-catalog__eyebrow">Studio Inventory</span>
                <h2 className="nex-catalog__heading">Available Instruments & Parts</h2>
              </div>

              {/* Search Bar */}
              <div className="nex-catalog__search-box">
                <SearchIcon size={16} className="nex-catalog__search-icon" />
                <input
                  type="text"
                  placeholder="Search by model, switch, keycap..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="nex-catalog__search-input"
                />
              </div>
            </div>

            {/* Catalog Grid */}
            {loading && products.length === 0 ? (
              <div className="nex-catalog__loading-grid">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="nex-skeleton-card" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="nex-catalog__grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="nex-catalog__empty">
                <BoxIcon size={48} className="nex-catalog__empty-icon" />
                <h3 className="nex-catalog__empty-title">
                  {searchQuery ? "No matching instruments found" : "No instruments listed yet"}
                </h3>
                <p className="nex-catalog__empty-desc">
                  {searchQuery
                    ? "Try adjusting your search terms or view our full catalog."
                    : "Become the first maker to publish a custom keyboard or artisan component."}
                </p>
                {user?.role === "seller" && (
                  <Link to="/seller/products/create" className="nex-catalog__empty-btn">
                    <BoxIcon size={16} />
                    <span>Create First Listing</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
