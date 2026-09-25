import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useProduct } from "../hooks/useProduct.js";
import { useAuth } from "../../auth/hook/useAuth.js";
import { useCart } from "../../cart/hooks/useCart.js";
import {
  ArrowLeftIcon,
  CartIcon,
  CheckIcon,
  ShieldIcon,
  SparklesIcon,
  BoxIcon,
} from "../components/Icons.jsx";
import "../styles/ProductDetail.scss";

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleGetProductById, loading } = useProduct();
  const { user } = useAuth();
  const { handleAddItem } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedConfigIndex, setSelectedConfigIndex] = useState(0);
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
        setSelectedConfigIndex(0);

        const initialImg =
          prod.images?.[0]?.url ||
          prod.images?.[0] ||
          "/assets/login-keyboard.jpg";
        setActiveImage(initialImg);
      }
    }
    loadProduct();
  }, [id]);

  // Aggregate base product model and any extra deployed variants
  const allConfigurations = useMemo(() => {
    if (!product) return [];

    const list = [];
    const rawVariants = product.variants || [];

    // Intelligently infer color/edition from product title / description
    let baseLabel = "Standard Base Model";
    const textToCheck = `${product.title || ""} ${product.description || ""}`.toLowerCase();

    // Check if any added variant specifically has "white" or other color
    const hasWhiteVariant = rawVariants.some((v) => {
      const attrs =
        v.attributes instanceof Map
          ? Object.fromEntries(v.attributes)
          : typeof v.attributes === "string"
          ? JSON.parse(v.attributes || "{}")
          : v.attributes || {};
      return String(attrs.color || "").toLowerCase().includes("white");
    });

    if (textToCheck.includes("black")) {
      baseLabel = "Black - Standard";
    } else if (textToCheck.includes("white") && !hasWhiteVariant) {
      baseLabel = "White - Standard";
    } else if (textToCheck.includes("silver")) {
      baseLabel = "Silver - Standard";
    } else if (hasWhiteVariant) {
      baseLabel = "Black - Standard";
    }

    // Default inferred specifications for the base configuration
    const baseAttrs = {
      Color: baseLabel,
      Switch: textToCheck.includes("optical")
        ? "Optical Switches Gen-3 - Standard Edition"
        : "Standard High-Performance Switches",
      Plate: textToCheck.includes("sensor")
        ? "Focus Pro 30K Optical Sensor Platform"
        : "Standard Reinforced Platform",
      Warranty: "2-Year Nexgear Replacement Warranty",
    };

    // 1. Add Base Configuration (Always selectable as default)
    list.push({
      _id: "default",
      isBase: true,
      displayName: baseLabel,
      attributes: baseAttrs,
      images: product.images || [],
      price: product.price,
      stock: 10,
    });

    // 2. Add extra deployed variants created by seller
    rawVariants.forEach((v, idx) => {
      let attrs = {};
      if (v.attributes) {
        if (v.attributes instanceof Map) {
          attrs = Object.fromEntries(v.attributes);
        } else if (typeof v.attributes === "string") {
          try {
            attrs = JSON.parse(v.attributes);
          } catch {
            attrs = { Spec: v.attributes };
          }
        } else {
          attrs = v.attributes;
        }
      }

      // Display name for variant button (e.g. "White-RZ01-04620200-R3A1")
      let vLabel = "";
      if (attrs.color) {
        vLabel = attrs.color;
      } else if (attrs.name) {
        vLabel = attrs.name;
      } else if (attrs.edition) {
        vLabel = attrs.edition;
      } else {
        const firstEntry = Object.entries(attrs)[0];
        if (firstEntry) {
          vLabel = `${firstEntry[0]}: ${firstEntry[1]}`;
        } else {
          vLabel = `Variant #${idx + 1}`;
        }
      }

      list.push({
        ...v,
        _id: v._id || `variant-${idx}`,
        isBase: false,
        displayName: vLabel,
        attributes: attrs,
        images: v.images && v.images.length > 0 ? v.images : product.images || [],
        price: v.price || product.price,
        stock: v.stock !== undefined ? v.stock : 10,
      });
    });

    return list;
  }, [product]);

  const activeConfig = useMemo(() => {
    if (allConfigurations.length === 0) return null;
    return allConfigurations[selectedConfigIndex] || allConfigurations[0];
  }, [allConfigurations, selectedConfigIndex]);

  // Dynamically resolve image gallery based on active configuration
  const currentImages = useMemo(() => {
    if (!product) return [];

    if (activeConfig?.images && activeConfig.images.length > 0) {
      const configImgs = activeConfig.images
        .map((img) => img?.url || img)
        .filter(Boolean);
      if (configImgs.length > 0) return configImgs;
    }

    if (product.images && product.images.length > 0) {
      const baseImgs = product.images
        .map((img) => img?.url || img)
        .filter(Boolean);
      if (baseImgs.length > 0) return baseImgs;
    }

    return [];
  }, [product, activeConfig]);

  const currentPrice =
    activeConfig?.price?.amount || product?.price?.amount || 0;
  const currentCurrency =
    activeConfig?.price?.currency || product?.price?.currency || "INR";
  const currentStock =
    activeConfig?.stock !== undefined ? activeConfig.stock : 10;

  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency === "INR" ? "INR" : "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleVariantSelect = (idx) => {
    setSelectedConfigIndex(idx);
    const targetConfig = allConfigurations[idx];
    if (targetConfig) {
      const targetImg =
        targetConfig.images?.[0]?.url ||
        targetConfig.images?.[0] ||
        product?.images?.[0]?.url ||
        product?.images?.[0] ||
        "/assets/login-keyboard.jpg";
      setActiveImage(targetImg);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!activeConfig) {
      setCartError("Please select a valid configuration.");
      return;
    }

    const variantId = activeConfig.isBase
      ? "default"
      : activeConfig._id || "default";

    setCartLoading(true);
    setCartError("");
    setCartSuccess(false);

    try {
      await handleAddItem({
        productId: product._id,
        variantId,
        quantity,
      });
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err) {
      setCartError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to add item to cart. Try again."
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
                {currentImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`nex-gallery__thumb ${
                      activeImage === imgUrl ? "is-active" : ""
                    }`}
                    onClick={() => setActiveImage(imgUrl)}
                  >
                    <img src={imgUrl} alt={`Preview ${i + 1}`} />
                  </button>
                ))}
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

              {/* Configuration Selector */}
              {allConfigurations.length > 0 && (
                <div className="nex-variants-section">
                  <label className="nex-variants-label">
                    Select Configuration ({allConfigurations.length}{" "}
                    {allConfigurations.length === 1 ? "Option" : "Options"})
                  </label>
                  <div className="nex-variants-grid">
                    {allConfigurations.map((config, idx) => {
                      const isSelected = selectedConfigIndex === idx;
                      const vPrice =
                        config.price?.amount || product.price?.amount || 0;
                      const vCurrency =
                        config.price?.currency || product.price?.currency || "INR";
                      const thumbImg =
                        config.images?.[0]?.url ||
                        config.images?.[0] ||
                        product.images?.[0]?.url ||
                        product.images?.[0];

                      return (
                        <button
                          key={config._id || idx}
                          type="button"
                          className={`nex-variant-btn ${
                            isSelected ? "is-selected" : ""
                          }`}
                          onClick={() => handleVariantSelect(idx)}
                        >
                          {thumbImg && (
                            <div className="nex-variant-thumb">
                              <img src={thumbImg} alt={config.displayName} />
                            </div>
                          )}
                          <div className="nex-variant-meta">
                            <span className="nex-variant-name">
                              {config.displayName}
                            </span>
                            <span className="nex-variant-price">
                              {formatPrice(vPrice, vCurrency)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Attributes Specifications Box */}
              {activeConfig?.attributes &&
                Object.keys(activeConfig.attributes).length > 0 && (
                  <div className="nex-specs-box">
                    {Object.entries(activeConfig.attributes).map(
                      ([key, val]) => (
                        <div key={key} className="nex-spec-row">
                          <span className="nex-spec-key">
                            {key.charAt(0).toUpperCase() + key.slice(1)}:
                          </span>
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
