import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useProduct } from "../hooks/useProduct.js";
import {
  PlusIcon,
  BoxIcon,
  LayersIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "../components/Icons.jsx";
import "../styles/Dashboard.scss";

export const Dashboard = () => {
  const { sellerProducts, loading, handleGetSellerProduct } = useProduct();

  useEffect(() => {
    handleGetSellerProduct();
  }, []);

  const totalProducts = sellerProducts.length;
  const totalVariants = sellerProducts.reduce(
    (acc, p) => acc + (p.variants?.length || 0),
    0
  );

  const formatPrice = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency === "INR" ? "INR" : "USD",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="nex-dashboard-page">
      <Navbar />

      <main className="nex-dashboard-main">
        <div className="nex-dashboard-container">
          {/* Header */}
          <div className="nex-dashboard-header">
            <div className="nex-dashboard-titles">
              <span className="nex-dashboard-eyebrow">Maker Portal</span>
              <h1 className="nex-dashboard-title">Seller Studio Dashboard</h1>
              <p className="nex-dashboard-subtitle">
                Manage your bespoke instrument listings, acoustic configurations, and inventory.
              </p>
            </div>

            <Link to="/seller/products/create" className="nex-dashboard-btn-create">
              <PlusIcon size={18} />
              <span>Create New Product</span>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="nex-dashboard-stats">
            <div className="nex-stat-card">
              <div className="nex-stat-card__icon">
                <BoxIcon size={20} />
              </div>
              <div className="nex-stat-card__meta">
                <span className="nex-stat-card__val">{totalProducts}</span>
                <span className="nex-stat-card__label">Active Listings</span>
              </div>
            </div>

            <div className="nex-stat-card">
              <div className="nex-stat-card__icon">
                <LayersIcon size={20} />
              </div>
              <div className="nex-stat-card__meta">
                <span className="nex-stat-card__val">{totalVariants}</span>
                <span className="nex-stat-card__label">Configured Variants</span>
              </div>
            </div>

            <div className="nex-stat-card">
              <div className="nex-stat-card__icon">
                <SparklesIcon size={20} />
              </div>
              <div className="nex-stat-card__meta">
                <span className="nex-stat-card__val">Verified</span>
                <span className="nex-stat-card__label">Maker Studio Status</span>
              </div>
            </div>
          </div>

          {/* Inventory Table / Grid */}
          <div className="nex-dashboard-table-card">
            <div className="nex-dashboard-table-header">
              <h2 className="nex-dashboard-table-title">Your Instruments & Components</h2>
            </div>

            {loading && sellerProducts.length === 0 ? (
              <div className="nex-dashboard-loading">
                <div className="spinner" />
                <span>Fetching studio catalog...</span>
              </div>
            ) : sellerProducts.length > 0 ? (
              <div className="nex-dashboard-table-wrapper">
                <table className="nex-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Base Price</th>
                      <th>Variants</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellerProducts.map((p) => {
                      const img =
                        p.images?.[0]?.url ||
                        p.images?.[0] ||
                        "/assets/login-keyboard.jpg";
                      return (
                        <tr key={p._id}>
                          <td>
                            <div className="nex-table-product">
                              <img
                                src={img}
                                alt={p.title}
                                className="nex-table-thumb"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/assets/login-keyboard.jpg";
                                }}
                              />
                              <div className="nex-table-product-info">
                                <span className="nex-table-product-title">
                                  {p.title}
                                </span>
                                <span className="nex-table-product-desc">
                                  {p.description}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="nex-table-price">
                              {formatPrice(
                                p.price?.amount,
                                p.price?.currency
                              )}
                            </span>
                          </td>
                          <td>
                            <span className="nex-table-variant-pill">
                              {p.variants?.length || 0} variants
                            </span>
                          </td>
                          <td>
                            <div className="nex-table-actions">
                              <Link
                                to={`/seller/products/${p._id}`}
                                className="nex-table-btn-manage"
                              >
                                <span>Manage Variants</span>
                                <ArrowRightIcon size={14} />
                              </Link>
                              <Link
                                to={`/products/${p._id}`}
                                className="nex-table-btn-view"
                                target="_blank"
                                rel="noreferrer"
                              >
                                View
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="nex-dashboard-empty">
                <BoxIcon size={40} />
                <h3>No instruments published yet</h3>
                <p>Start selling your custom keyboards, switches, and components on Nexgear.</p>
                <Link to="/seller/products/create" className="nex-dashboard-empty-btn">
                  <PlusIcon size={16} />
                  <span>Create First Listing</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
