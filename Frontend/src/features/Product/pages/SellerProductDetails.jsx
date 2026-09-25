import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useProduct } from "../hooks/useProduct.js";
import {
  ArrowLeftIcon,
  PlusIcon,
  CheckIcon,
  SparklesIcon,
  BoxIcon,
  LayersIcon,
  UploadIcon,
  ExternalLinkIcon,
} from "../components/Icons.jsx";
import "../styles/SellerProductDetails.scss";

export const SellerProductDetails = () => {
  const { id } = useParams();
  const {
    handleGetProductById,
    handleAddProductVariant,
    loading,
    error,
    clearProductError,
  } = useProduct();

  const [product, setProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [variantForm, setVariantForm] = useState({
    stock: 20,
    priceAmount: "",
    priceCurrency: "INR",
    color: "",
    switchType: "",
    plate: "",
  });
  const [variantFiles, setVariantFiles] = useState([]);
  const [variantPreviews, setVariantPreviews] = useState([]);
  const [localMsg, setLocalMsg] = useState({ error: "", success: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchProduct = async () => {
    const res = await handleGetProductById(id);
    if (res.success && res.data?.product) {
      setProduct(res.data.product);
      if (!variantForm.priceAmount) {
        setVariantForm((prev) => ({
          ...prev,
          priceAmount: res.data.product.price?.amount || "",
          priceCurrency: res.data.product.price?.currency || "INR",
        }));
      }
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVariantForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setVariantFiles((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setVariantPreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveFile = (index) => {
    setVariantFiles((prev) => prev.filter((_, i) => i !== index));
    setVariantPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAddVariantSubmit = async (e) => {
    e.preventDefault();
    setLocalMsg({ error: "", success: "" });
    clearProductError();

    if (!variantForm.priceAmount || Number(variantForm.priceAmount) <= 0) {
      setLocalMsg({ error: "Please enter a valid variant price.", success: "" });
      return;
    }

    const attributes = {};
    if (variantForm.color.trim()) attributes.color = variantForm.color.trim();
    if (variantForm.switchType.trim()) attributes.switch = variantForm.switchType.trim();
    if (variantForm.plate.trim()) attributes.plate = variantForm.plate.trim();

    setSubmitting(true);

    const formData = new FormData();
    formData.append("stock", variantForm.stock);
    formData.append("priceAmount", variantForm.priceAmount);
    formData.append("priceCurrency", variantForm.priceCurrency);
    formData.append("attributes", JSON.stringify(attributes));

    variantFiles.forEach((file) => {
      formData.append("images", file);
    });

    const result = await handleAddProductVariant(id, formData);
    setSubmitting(false);

    if (result.success) {
      setLocalMsg({
        error: "",
        success: "Variant added successfully to your instrument!",
      });
      setShowAddModal(false);
      setVariantFiles([]);
      setVariantPreviews([]);
      fetchProduct();
    } else {
      setLocalMsg({
        error: result.error || "Failed to add variant. Please try again.",
        success: "",
      });
    }
  };

  const formatPrice = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency === "INR" ? "INR" : "USD",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (!product && loading) {
    return (
      <div className="nex-seller-detail-page">
        <Navbar />
        <div className="nex-seller-detail-loading">
          <div className="spinner" />
          <span>Loading instrument details...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="nex-seller-detail-page">
        <Navbar />
        <div className="nex-seller-detail-not-found">
          <h2>Instrument not found</h2>
          <Link to="/seller/dashboard" className="nex-btn-back-dash">
            <ArrowLeftIcon size={16} />
            <span>Return to Studio Dashboard</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const variants = product.variants || [];

  return (
    <div className="nex-seller-detail-page">
      <Navbar />

      <main className="nex-seller-detail-main">
        <div className="nex-seller-detail-container">
          {/* Top Bar */}
          <div className="nex-seller-detail-topbar">
            <Link to="/seller/dashboard" className="nex-btn-back-dash">
              <ArrowLeftIcon size={16} />
              <span>Back to Studio Dashboard</span>
            </Link>
            <Link
              to={`/products/${product._id}`}
              className="nex-btn-view-public"
              target="_blank"
              rel="noreferrer"
            >
              <span>View Public Page</span>
              <ExternalLinkIcon size={14} />
            </Link>
          </div>

          {/* Product Summary Header Card */}
          <div className="nex-product-summary-card">
            <div className="nex-product-summary-media">
              <img
                src={
                  product.images?.[0]?.url ||
                  product.images?.[0] ||
                  "/assets/login-keyboard.jpg"
                }
                alt={product.title}
                className="nex-product-summary-thumb"
                onError={(e) => {
                  e.currentTarget.src = "/assets/login-keyboard.jpg";
                }}
              />
            </div>

            <div className="nex-product-summary-meta">
              <div className="nex-product-summary-tag">Maker Studio Instrument</div>
              <h1 className="nex-product-summary-title">{product.title}</h1>
              <p className="nex-product-summary-desc">{product.description}</p>
              <div className="nex-product-summary-price">
                Base Price:{" "}
                <strong>
                  {formatPrice(product.price?.amount, product.price?.currency)}
                </strong>
              </div>
            </div>
          </div>

          {/* Messages */}
          {localMsg.success && (
            <div className="nex-alert-banner success">
              <CheckIcon size={18} />
              <span>{localMsg.success}</span>
            </div>
          )}
          {(localMsg.error || error) && (
            <div className="nex-alert-banner error">
              <span>{localMsg.error || error}</span>
            </div>
          )}

          {/* Variants Section */}
          <div className="nex-seller-variants-section">
            <div className="nex-seller-variants-header">
              <div>
                <h2 className="nex-seller-variants-title">
                  Configured Variants ({variants.length})
                </h2>
                <p className="nex-seller-variants-sub">
                  Each variant defines a unique colorway, switch type, or acoustic dampening package.
                </p>
              </div>

              <button
                type="button"
                className="nex-btn-open-variant-modal"
                onClick={() => setShowAddModal(true)}
              >
                <PlusIcon size={16} />
                <span>Add Variant</span>
              </button>
            </div>

            {variants.length > 0 ? (
              <div className="nex-seller-variants-grid">
                {variants.map((v, i) => {
                  const img =
                    v.images?.[0]?.url ||
                    v.images?.[0] ||
                    product.images?.[0]?.url ||
                    "/assets/login-keyboard.jpg";
                  return (
                    <div key={v._id || i} className="nex-variant-card">
                      <div className="nex-variant-card__media">
                        <img src={img} alt={`Variant ${i + 1}`} />
                        <span className="nex-variant-card__badge">
                          Variant #{i + 1}
                        </span>
                      </div>

                      <div className="nex-variant-card__content">
                        <div className="nex-variant-card__price-row">
                          <span className="nex-variant-card__price">
                            {formatPrice(
                              v.price?.amount || product.price?.amount,
                              v.price?.currency || product.price?.currency
                            )}
                          </span>
                          <span className="nex-variant-card__stock">
                            Stock: {v.stock ?? 0}
                          </span>
                        </div>

                        {v.attributes && Object.keys(v.attributes).length > 0 && (
                          <div className="nex-variant-card__attrs">
                            {Object.entries(v.attributes).map(([key, val]) => (
                              <span key={key} className="nex-variant-attr-tag">
                                {key}: <strong>{String(val)}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="nex-seller-variants-empty">
                <LayersIcon size={36} />
                <h3>Active as Base Instrument (Default)</h3>
                <p>
                  This product is currently available to buyers in its standard base configuration. You can optionally configure specialized colorways, switch variations, or plate materials below.
                </p>
                <button
                  type="button"
                  className="nex-btn-open-variant-modal"
                  onClick={() => setShowAddModal(true)}
                >
                  <PlusIcon size={16} />
                  <span>Add Custom Variant</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add Variant Modal */}
        {showAddModal && (
          <div className="nex-modal-overlay">
            <div className="nex-modal-card">
              <header className="nex-modal-header">
                <h3>Add Product Variant</h3>
                <button
                  type="button"
                  className="nex-modal-close-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  &times;
                </button>
              </header>

              <form onSubmit={handleAddVariantSubmit} className="nex-modal-form">
                <div className="nex-form-row">
                  <div className="nex-form-group flex-2">
                    <label className="nex-form-label">Price Amount</label>
                    <input
                      type="number"
                      name="priceAmount"
                      value={variantForm.priceAmount}
                      onChange={handleInputChange}
                      placeholder="e.g. 15999"
                      min="1"
                      className="nex-form-input"
                      required
                    />
                  </div>

                  <div className="nex-form-group flex-1">
                    <label className="nex-form-label">Stock Units</label>
                    <input
                      type="number"
                      name="stock"
                      value={variantForm.stock}
                      onChange={handleInputChange}
                      min="0"
                      className="nex-form-input"
                      required
                    />
                  </div>
                </div>

                {/* Attributes */}
                <div className="nex-form-group">
                  <label className="nex-form-label">Color / Finish</label>
                  <input
                    type="text"
                    name="color"
                    value={variantForm.color}
                    onChange={handleInputChange}
                    placeholder="e.g. Midnight Obsidian / Nebula Anodized"
                    className="nex-form-input"
                  />
                </div>

                <div className="nex-form-group">
                  <label className="nex-form-label">Pre-installed Switches</label>
                  <input
                    type="text"
                    name="switchType"
                    value={variantForm.switchType}
                    onChange={handleInputChange}
                    placeholder="e.g. Gateron Oil King Linear (Lubed)"
                    className="nex-form-input"
                  />
                </div>

                <div className="nex-form-group">
                  <label className="nex-form-label">Plate / Mounting</label>
                  <input
                    type="text"
                    name="plate"
                    value={variantForm.plate}
                    onChange={handleInputChange}
                    placeholder="e.g. FR4 Plate / Gasket Silicone"
                    className="nex-form-input"
                  />
                </div>

                {/* Images */}
                <div className="nex-form-group">
                  <label className="nex-form-label">Variant Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="nex-form-input"
                  />
                  {variantPreviews.length > 0 && (
                    <div className="nex-preview-grid">
                      {variantPreviews.map((url, i) => (
                        <div key={i} className="nex-preview-item">
                          <img src={url} alt={`Preview ${i + 1}`} />
                          <button
                            type="button"
                            className="nex-preview-remove"
                            onClick={() => handleRemoveFile(i)}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="nex-modal-actions">
                  <button
                    type="button"
                    className="nex-btn-cancel"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="nex-btn-submit-variant"
                    disabled={submitting}
                  >
                    {submitting ? "Adding Variant..." : "Save Variant"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SellerProductDetails;
