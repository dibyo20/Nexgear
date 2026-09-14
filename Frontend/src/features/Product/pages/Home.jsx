import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useProduct } from "../hooks/useProduct.js";
import { useAuth } from "../../auth/hook/useAuth.js";
import { SearchIcon, BoxIcon, SparklesIcon } from "../components/Icons.jsx";
import "../styles/Home.scss";

const DISPLAY_CATEGORIES = [
  "All Items",
  "Keyboards",
  "Gaming Mice",
  "Mechanical Switches",
  "Keycap Sets",
  "Artisan Caps",
  "Audio & Acoustics",
  "Desk Mats & Accessories",
];

export const Home = () => {
  const navigate = useNavigate();
  const { products, loading, handleGetAllProducts } = useProduct();
  const { user } = useAuth();

  const [activeCategory, setActiveCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?.role === "seller") {
      navigate("/seller/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    handleGetAllProducts();
  }, []);

  // Filter products by search text
  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      product.title?.toLowerCase().includes(q) ||
      product.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="nex-home">
      <Navbar />

      <main className="nex-home__main">
        {/* Top Search & Store Header */}
        <section className="nex-store-top">
          <div className="nex-store-top__container">
            <div className="nex-store-top__header">
              <div>
                <div className="nex-store-top__badge">
                  <SparklesIcon size={13} />
                  <span>Studio Hardware Inventory</span>
                </div>
                <h1 className="nex-store-top__title">Available Instruments & Gear</h1>
                <p className="nex-store-top__subtitle">
                  Browse professional keyboards, precision mice, switches, and artisan components.
                </p>
              </div>
            </div>

            {/* 1. Search Option at Top */}
            <div className="nex-store-top__search-row">
              <div className="nex-store-top__search-box">
                <SearchIcon size={18} className="nex-store-top__search-icon" />
                <input
                  type="text"
                  placeholder="Search products by model name, switch, keycap..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="nex-store-top__search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="nex-store-top__search-clear"
                    aria-label="Clear search"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>

            {/* 2. Different Types of Categories Filter (UI placeholder for now) */}
            <div className="nex-store-top__categories-row">
              <span className="nex-store-top__categories-label">Categories:</span>
              <div className="nex-store-top__categories-list" role="tablist">
                {DISPLAY_CATEGORIES.map((category) => {
                  const isActive = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`nex-store-top__category-chip ${
                        isActive ? "nex-store-top__category-chip--active" : ""
                      }`}
                      role="tab"
                      aria-selected={isActive}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Listed Products Shown One by One */}
        <section className="nex-store-products">
          <div className="nex-store-products__container">
            <div className="nex-store-products__header">
              <h2 className="nex-store-products__heading">
                All Products ({filteredProducts.length})
              </h2>
            </div>

            {loading && products.length === 0 ? (
              <div className="nex-store-products__loading-grid">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="nex-skeleton-card" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="nex-store-products__grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="nex-store-products__empty">
                <BoxIcon size={48} className="nex-store-products__empty-icon" />
                <h3 className="nex-store-products__empty-title">
                  {searchQuery ? "No matching products found" : "No instruments listed yet"}
                </h3>
                <p className="nex-store-products__empty-desc">
                  {searchQuery
                    ? "Try adjusting your search query."
                    : "Products will be displayed here as they are published by sellers."}
                </p>
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="nex-store-products__empty-btn"
                  >
                    Clear Search
                  </button>
                ) : user?.role === "seller" ? (
                  <Link
                    to="/seller/products/create"
                    className="nex-store-products__empty-btn"
                  >
                    <BoxIcon size={16} />
                    <span>Create First Listing</span>
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
