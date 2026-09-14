import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useProduct } from "../hooks/useProduct.js";
import { useAuth } from "../../auth/hook/useAuth.js";
import {
  ArrowLeftIcon,
  CartIcon,
  CheckIcon,
  ShieldIcon,
  SparklesIcon,
  BoxIcon,
} from "../components/Icons.jsx";
import axios from "axios";
import "../styles/ProductDetail.scss";

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleGetProductById, loading } = useProduct();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      const res = await handleGetProductById(id);
      if (res.success && res.data?.product) {
        const prod = res.data.product;
        setProduct(prod);

        const initialImg =
          prod.images?.[0]?.url ||
          prod.images?.[0] ||
          "/assets/login-keyboard.jpg";
        setActiveImage(initialImg);
      }
    }
    loadProduct();
  }, [id]);

  const variants = product?.variants || [];
  const activeVariant = variants[selectedVariantIndex] || null;

  // Active pricing & stock
  const currentPrice =
    activeVariant?.price?.amount || product?.price?.amount || 0;
  const currentCurrency =
    activeVariant?.price?.currency || product?.price?.currency || "INR";
  const currentStock =
    activeVariant?.stock !== undefined ? activeVariant.stock : 10;

  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency === "INR" ? "INR" : "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleVariantSelect = (idx) => {
    setSelectedVariantIndex(idx);
    const variant = variants[idx];
    if (variant?.images?.[0]?.url) {
      setActiveImage(variant.images[0].url);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (variants.length > 0 && !activeVariant?._id) {
      setCartError("Please select a valid variant.");
      return;
    }

    const variantId = activeVariant?._id || "default";

    setCartLoading(true);
    setCartError("");
    setCartSuccess(false);

    try {
      await axios.post(
        `/api/cart/${product._id}/${variantId}`,
        { quantity },
        { withCredentials: true }
      );
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err) {
      setCartError(
        err?.response?.data?.message || "Failed to add item to cart. Try again."
      );
    } finally {
      setCartLoading(false);
    }
  };

  if (loading && !product) {
    return (
      <div className="nex-detail-page">
        <Navbar />
        <div className="nex-detail-loading">
          <div className="spinner" />
          <span>Loading specifications...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="nex-detail-page">
        <Navbar />
        <div className="nex-detail-not-found">
          <h2>Instrument not found</h2>
          <p>The product you are looking for may have been retired or removed.</p>
          <Link to="/" className="nex-btn-back">
            <ArrowLeftIcon size={16} />
            <span>Return to Catalog</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="nex-detail-page">
      <Navbar />

      <main className="nex-detail-main">
        <div className="nex-detail-container">
          {/* Breadcrumb */}
          <nav className="nex-detail-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Catalog</Link>
            <span>/</span>
            <span className="current">{product.title}</span>
          </nav>

          <div className="nex-detail-layout">
            {/* Gallery Column */}
            <div className="nex-gallery">
              <div className="nex-gallery__hero">
                <img
                  src={activeImage || "/assets/login-keyboard.jpg"}
                  alt={product.title}
                  className="nex-gallery__img-main"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/login-keyboard.jpg";
                  }}
                />
              </div>

              {/* Thumbnails */}
              <div className="nex-gallery__thumbs">
                {product.images?.map((img, i) => {
                  const url = img.url || img;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`nex-gallery__thumb ${
                        activeImage === url ? "is-active" : ""
                      }`}
                      onClick={() => setActiveImage(url)}
                    >
                      <img src={url} alt={`Preview ${i + 1}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Meta & Actions Column */}
            <div className="nex-info">
              <div className="nex-info__header">
                <div className="nex-info__badges">
                  <span className="nex-badge-primary">Nexgear Certified</span>
                  {currentStock > 0 ? (
                    <span className="nex-badge-stock in-stock">
                      <CheckIcon size={12} />
                      <span>{currentStock} in stock</span>
                    </span>
                  ) : (
                    <span className="nex-badge-stock out-of-stock">
                      Sold Out
                    </span>
                  )}
                </div>

                <h1 className="nex-info__title">{product.title}</h1>

                <div className="nex-info__price-strip">
                  <span className="nex-info__price">
                    {formatPrice(currentPrice, currentCurrency)}
                  </span>
                  <span className="nex-info__tax-note">
                    Taxes included &middot; Free dispatch
                  </span>
                </div>
              </div>

              <p className="nex-info__desc">{product.description}</p>

              {/* Variant Selector */}
              {variants.length > 0 && (
                <div className="nex-variants-section">
                  <label className="nex-variants-label">
                    Select Configuration ({variants.length} options)
                  </label>
                  <div className="nex-variants-grid">
                    {variants.map((variant, idx) => {
                      const isSelected = selectedVariantIndex === idx;
                      const vPrice =
                        variant.price?.amount || product.price.amount;
                      const vCurrency =
                        variant.price?.currency || product.price.currency;
                      const attrName =
                        variant.attributes?.name ||
                        variant.attributes?.color ||
                        variant.attributes?.edition ||
                        `Edition #${idx + 1}`;

                      return (
                        <button
                          key={variant._id || idx}
                          type="button"
                          className={`nex-variant-btn ${
                            isSelected ? "is-selected" : ""
                          }`}
                          onClick={() => handleVariantSelect(idx)}
                        >
                          <span className="nex-variant-name">{attrName}</span>
                          <span className="nex-variant-price">
                            {formatPrice(vPrice, vCurrency)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Attributes Specifications Pill Grid */}
              {activeVariant?.attributes &&
                Object.keys(activeVariant.attributes).length > 0 && (
                  <div className="nex-spec-pills">
                    {Object.entries(activeVariant.attributes).map(
                      ([key, val]) => (
                        <div key={key} className="nex-spec-pill">
                          <span className="nex-spec-key">{key}:</span>
                          <span className="nex-spec-val">{String(val)}</span>
                        </div>
                      )
                    )}
                  </div>
                )}

              {/* Purchase Controls */}
              <div className="nex-purchase-box">
                <div className="nex-quantity-selector">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.min(currentStock, q + 1))
                    }
                    disabled={quantity >= currentStock}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="nex-btn-add-cart"
                  onClick={handleAddToCart}
                  disabled={cartLoading || currentStock <= 0}
                >
                  {cartLoading ? (
                    <span>Updating Cart...</span>
                  ) : cartSuccess ? (
                    <>
                      <CheckIcon size={18} />
                      <span>Item Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <CartIcon size={18} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>

              {cartError && (
                <div className="nex-cart-error-banner">{cartError}</div>
              )}

              {/* Quality & Authenticity Guarantee */}
              <div className="nex-guarantee-box">
                <div className="nex-guarantee-item">
                  <ShieldIcon size={18} />
                  <div>
                    <strong>2-Year Studio Warranty</strong>
                    <p>Covers PCB, internal dampeners, and anodized housing.</p>
                  </div>
                </div>
                <div className="nex-guarantee-item">
                  <SparklesIcon size={18} />
                  <div>
                    <strong>Hand-Lubed & Sound Tested</strong>
                    <p>Inspected for resonance and acoustic purity.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
