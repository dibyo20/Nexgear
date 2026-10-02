import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../Product/components/Navbar.jsx";
import Footer from "../../Product/components/Footer.jsx";
import { useCart } from "../hooks/useCart.js";
import { useAuth } from "../../auth/hook/useAuth.js";
import CartItem from "../components/CartItem.jsx";
import CartSummary from "../components/CartSummary.jsx";
import PaymentSuccessModal from "../components/PaymentSuccessModal.jsx";
import { loadRazorpayScript } from "../utils/razorpay.js";
import {
  CartIcon,
  ArrowRightIcon,
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
    cartSavings = 0,
    handleGetCart,
    handleIncreamentCartItem,
    handleDecreamentCartItem,
    handleCreatePaymentOrder,
    handleVerifyPaymentOrder,
    clearCartError,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccessDetails, setPaymentSuccessDetails] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updatingKey, setUpdatingKey] = useState(null);

  useEffect(() => {
    handleGetCart();
  }, []);

  const formatPrice = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency === "INR" ? "INR" : "USD",
      maximumFractionDigits: 0,
    }).format(amount || 0);
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

  const handleProceedToCheckout = async () => {
    if (items.length === 0 || isProcessingPayment) return;

    setPaymentError(null);
    setIsProcessingPayment(true);

    try {
      // 1. Ensure Razorpay checkout script is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || !window.Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      // 2. Fetch Razorpay key ID from Vite environment variable
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Payment gateway configuration missing (VITE_RAZORPAY_KEY_ID).");
      }

      // 3. Create order on backend
      const orderResponse = await handleCreatePaymentOrder();
      if (!orderResponse?.order?.id) {
        throw new Error(orderResponse?.message || "Failed to initialize payment order.");
      }

      const order = orderResponse.order;

      // 4. Configure Razorpay checkout options
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Nexgear Studio",
        description: "Custom Mechanical Hardware & Instruments",
        image: "/nexgear-logo.svg",
        order_id: order.id,
        handler: async function (response) {
          try {
            setIsProcessingPayment(true);
            const verifyRes = await handleVerifyPaymentOrder({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setPaymentSuccessDetails({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              amount: (order.amount || 0) / 100,
              currency: order.currency || "INR",
            });
            setShowSuccessModal(true);
            setCheckoutSuccess(true);
          } catch (err) {
            console.error("Payment verification failed:", err);
            setPaymentError(
              err?.response?.data?.message ||
              err?.message ||
              "Payment verification failed. Please contact support."
            );
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.fullname || user?.name || "",
          email: user?.email || "",
          contact: user?.contact || user?.phone || "",
        },
        theme: {
          color: "#0066ff",
          backdrop_color: "#08090b",
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error("Razorpay Payment Failed:", response.error);
        setIsProcessingPayment(false);
        setPaymentError(
          response.error?.description ||
          response.error?.reason ||
          "Payment transaction could not be completed."
        );
      });

      rzp.open();
    } catch (err) {
      console.error("Error during checkout:", err);
      setIsProcessingPayment(false);
      setPaymentError(
        err?.response?.data?.message ||
        err?.message ||
        "Could not initiate checkout process."
      );
    }
  };

  const onIncrement = async (prodId, varId, itemKey) => {
    if (updatingKey) return;
    setUpdatingKey(itemKey);
    try {
      await handleIncreamentCartItem({ productId: prodId, variantId: varId || "default" });
    } catch (err) {
      // Error is tracked in Redux error state
    } finally {
      setUpdatingKey(null);
    }
  };

  const onDecrement = async (prodId, varId, itemKey) => {
    if (updatingKey) return;
    setUpdatingKey(itemKey);
    try {
      await handleDecreamentCartItem({ productId: prodId, variantId: varId || "default" });
    } catch (err) {
      // Error is tracked in Redux error state
    } finally {
      setUpdatingKey(null);
    }
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
        {(error || paymentError) && (
          <div className="nex-cart-error-toast" role="alert">
            <span>{paymentError || error}</span>
            <button
              type="button"
              onClick={() => {
                clearCartError();
                setPaymentError(null);
              }}
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        )}

        {/* Empty State vs Loaded Cart */}
        {items.length === 0 && !showSuccessModal ? (
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
                to="/"
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
                const itemKey = `${prodId}-${varId || idx}`;

                return (
                  <CartItem
                    key={itemKey}
                    item={item}
                    updatingKey={updatingKey}
                    loading={loading}
                    onIncrement={onIncrement}
                    onDecrement={onDecrement}
                    formatPrice={formatPrice}
                  />
                );
              })}
            </div>

            {/* Right Column: Order Summary */}
            <div className="nex-cart-summary-column">
              <CartSummary
                cartTotal={cartTotal}
                cartSavings={cartSavings}
                finalTotal={finalTotal}
                appliedDiscount={appliedDiscount}
                discountAmount={discountAmount}
                promoCode={promoCode}
                setPromoCode={setPromoCode}
                promoError={promoError}
                handleApplyPromo={handleApplyPromo}
                setAppliedDiscount={setAppliedDiscount}
                handleProceedToCheckout={handleProceedToCheckout}
                loading={loading}
                isProcessingPayment={isProcessingPayment}
                checkoutSuccess={checkoutSuccess}
                formatPrice={formatPrice}
                disabled={items.length === 0}
              />
            </div>
          </div>
        )}
      </main>

      {/* Payment Success Confirmation Modal */}
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        paymentDetails={paymentSuccessDetails}
        onClose={() => setShowSuccessModal(false)}
      />

      <Footer />
    </div>
  );
};

export default CartPage;
