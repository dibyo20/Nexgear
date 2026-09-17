import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../Product/components/Navbar.jsx";
import Footer from "../../Product/components/Footer.jsx";
import { useCart } from "../hooks/useCart.js";
import { useAuth } from "../../auth/hook/useAuth.js";
import {
  CartIcon,
  ArrowRightIcon,
  ShieldIcon,
  SparklesIcon,
  LockIcon,
  CheckIcon,
} from "../../Product/components/Icons.jsx";
import "../styles/CartPage.scss";

export const CartPage = () => {
  const { user } = useAuth();
  const {
    items = [],
    loading,
    error,
    cartCount,
    cartTotal,
    handleGetCart,
    clearCartError,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    handleGetCart();
  }, []);

  const formatPrice = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency === "INR" ? "INR" : "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError("");
    const trimmed = promoCode.trim().toUpperCase();
    if (!trimmed) return;

    if (trimmed === "NEXGEAR10" || trimmed === "STUDIO10") {
      setAppliedDiscount({ code: trimmed, percent: 10 });
      setPromoCode("");
    } else if (trimmed === "NEXPRO20") {
      setAppliedDiscount({ code: trimmed, percent: 20 });
      setPromoCode("");
    } else {
      setPromoError("Invalid promotional code");
    }
  };

  const discountAmount = appliedDiscount
    ? Math.round((cartTotal * appliedDiscount.percent) / 100)
    : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const handleProceedToCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
    }, 4000);
  };

  return (
    <div className="nex-cart-page">
      <Navbar />

      <main className="nex-cart-main">
        {/* Breadcrumb & Header */}
        <div className="nex-cart-header">
          <nav className="nex-cart-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Catalog</Link>
            <span>/</span>
            <span className="current">Shopping Bag</span>
          </nav>

          <div className="nex-cart-title-row">
            <h1>Studio Cart</h1>
            <div className="nex-cart-count-badge">
              <CartIcon size={16} />
              <span>
                <strong className="highlight">{cartCount}</strong>{" "}
                {cartCount === 1 ? "Instrument" : "Instruments"}
              </span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="nex-cart-error-toast" role="alert">
            <span>{error}</span>
            <button
              type="button"
              onClick={clearCartError}
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        )}

        {/* Empty State vs Loaded Cart */}
        {items.length === 0 ? (
          <div className="nex-empty-cart">
            <div className="nex-empty-icon-halo">
              <CartIcon size={40} />
            </div>
            <h2>Your studio bag is empty</h2>
            <p>
              Your mechanical workspace awaits. Discover precision custom
              keyboards, artisan keycaps, and acoustic modding accessories.
            </p>
            <div className="nex-empty-actions">
              <Link
                to="/home"
                className="nex-btn-checkout"
                style={{ textDecoration: "none" }}
              >
                <span>Explore Instruments</span>
                <ArrowRightIcon size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="nex-cart-layout">
            {/* Left Column: Items List */}
            <div className="nex-cart-items-column">
              <div className="nex-cart-items-header">
                <span>Items in your bag ({items.length})</span>
              </div>

              {items.map((item, idx) => {
                const prod = item.product || {};
                const prodId = prod._id || prod;
                const varId = item.variant?._id || item.variant;

                // Find variant details from populated product
                let variantObj = null;
                if (prod.variants && varId) {
                  variantObj = prod.variants.find(
                    (v) => v._id?.toString() === varId.toString()
                  );
                }

                // Pricing calculation
                const unitPrice =
                  item.price?.amount ||
                  variantObj?.price?.amount ||
                  prod.price?.amount ||
                  0;
                const currency =
                  item.price?.currency ||
                  variantObj?.price?.currency ||
                  prod.price?.currency ||
                  "INR";
                const lineTotal = unitPrice * (item.quantity || 1);

                // Image handling
                const itemImg =
                  variantObj?.images?.[0]?.url ||
                  variantObj?.images?.[0] ||
                  prod.images?.[0]?.url ||
                  prod.images?.[0] ||
                  "/assets/login-keyboard.jpg";

                const itemKey = `${prodId}-${varId || idx}`;

                return (
                  <div key={itemKey} className="nex-cart-card">
                    {/* Thumbnail */}
                    <div className="nex-cart-thumb">
                      <Link to={`/products/${prodId}`}>
                        <img
                          src={itemImg}
                          alt={prod.title || "Nexgear Product"}
                          onError={(e) => {
                            e.currentTarget.src = "/assets/login-keyboard.jpg";
                          }}
                        />
                      </Link>
                    </div>

                    {/* Product & Variant Details */}
                    <div className="nex-cart-info">
                      <Link
                        to={`/products/${prodId}`}
                        className="nex-cart-item-title"
                      >
                        {prod.title || "Custom Mechanical Instrument"}
                      </Link>

                      {/* Variant attribute badges */}
                      {variantObj?.attributes && (
                        <div className="nex-cart-variant-badges">
                          {Object.entries(
                            variantObj.attributes instanceof Map
                              ? Object.fromEntries(variantObj.attributes)
                              : variantObj.attributes
                          ).map(([k, v]) => (
                            <span key={k} className="nex-cart-spec-badge">
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="nex-cart-unit-price">
                        {formatPrice(unitPrice, currency)} each
                      </div>
                    </div>

                    {/* Quantity Display */}
                    <div className="nex-cart-qty-ctrl">
                      <span className="nex-cart-qty-value" style={{ width: "auto", padding: "0 0.75rem" }}>
                        Qty: {item.quantity || 1}
                      </span>
                    </div>

                    {/* Line Total */}
                    <div className="nex-cart-actions-col">
                      <div className="nex-cart-item-total">
                        {formatPrice(lineTotal, currency)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Order Summary */}
            <div className="nex-cart-summary-column">
              <div className="nex-summary-card">
                <h2 className="nex-summary-title">Order Summary</h2>

                <div className="nex-summary-rows">
                  <div className="nex-summary-row">
                    <span>Subtotal</span>
                    <span className="val">{formatPrice(cartTotal)}</span>
                  </div>

                  <div className="nex-summary-row">
                    <span>Express Dispatch</span>
                    <span className="val free">FREE</span>
                  </div>

                  <div className="nex-summary-row">
                    <span>Taxes</span>
                    <span className="val">Included</span>
                  </div>

                  {appliedDiscount && (
                    <div className="nex-summary-row">
                      <span>Discount ({appliedDiscount.code})</span>
                      <span className="val discount">
                        -{formatPrice(discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className="nex-summary-divider" />

                  <div className="nex-summary-row nex-summary-row--total">
                    <span>Estimated Total</span>
                    <span className="val-total">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Promo Voucher */}
                {appliedDiscount ? (
                  <div className="nex-applied-voucher">
                    <span>
                      Voucher <strong>{appliedDiscount.code}</strong> applied (
                      {appliedDiscount.percent}% OFF)
                    </span>
                    <button
                      type="button"
                      onClick={() => setAppliedDiscount(null)}
                      title="Remove coupon"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="nex-promo-box">
                    <input
                      type="text"
                      placeholder="PROMO CODE (e.g. NEXGEAR10)"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        if (promoError) setPromoError("");
                      }}
                    />
                    <button type="submit">Apply</button>
                  </form>
                )}

                {promoError && (
                  <div
                    style={{
                      color: "#ef4444",
                      fontSize: "0.8rem",
                      marginTop: "-0.5rem",
                    }}
                  >
                    {promoError}
                  </div>
                )}

                {/* Checkout CTA */}
                <button
                  type="button"
                  className="nex-btn-checkout"
                  onClick={handleProceedToCheckout}
                  disabled={loading || items.length === 0}
                >
                  {checkoutSuccess ? (
                    <>
                      <CheckIcon size={18} />
                      <span>Order Placed Successfully!</span>
                    </>
                  ) : (
                    <>
                      <LockIcon size={18} />
                      <span>Proceed to Checkout</span>
                      <ArrowRightIcon size={18} />
                    </>
                  )}
                </button>

                {/* Trust and Guarantee Bullet Points */}
                <div className="nex-trust-bullets">
                  <div className="nex-trust-bullet">
                    <ShieldIcon size={16} />
                    <span>2-Year Studio Hardware Warranty</span>
                  </div>
                  <div className="nex-trust-bullet">
                    <SparklesIcon size={16} />
                    <span>Quality Inspected & Acoustically Tested</span>
                  </div>
                  <div className="nex-trust-bullet">
                    <LockIcon size={16} />
                    <span>256-Bit Encrypted Secure Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
