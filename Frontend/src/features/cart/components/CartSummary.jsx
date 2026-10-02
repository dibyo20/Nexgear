import React from "react";
import {
  ArrowRightIcon,
  ShieldIcon,
  SparklesIcon,
  LockIcon,
  CheckIcon,
} from "../../Product/components/Icons.jsx";

export const CartSummary = ({
  cartTotal,
  cartSavings = 0,
  finalTotal,
  appliedDiscount,
  discountAmount,
  promoCode,
  setPromoCode,
  promoError,
  handleApplyPromo,
  setAppliedDiscount,
  handleProceedToCheckout,
  loading,
  isProcessingPayment,
  checkoutSuccess,
  formatPrice,
  disabled,
}) => {
  return (
    <div className="nex-summary-card">
      <h2 className="nex-summary-title">Order Summary</h2>

      <div className="nex-summary-rows">
        <div className="nex-summary-row">
          <span>Hardware Subtotal</span>
          <span className="val">{formatPrice(cartTotal)}</span>
        </div>

        {cartSavings > 0 && (
          <div className="nex-summary-row nex-summary-row--savings">
            <span className="savings-lbl">Seller Price Drop Savings</span>
            <span className="val savings">-{formatPrice(cartSavings)}</span>
          </div>
        )}

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
            <span className="val discount">-{formatPrice(discountAmount)}</span>
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
            onChange={(e) => setPromoCode(e.target.value)}
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
        className={`nex-btn-checkout ${isProcessingPayment ? "loading" : ""}`}
        onClick={handleProceedToCheckout}
        disabled={disabled || loading || isProcessingPayment}
      >
        {isProcessingPayment ? (
          <>
            <div className="nex-btn-spinner" />
            <span>Connecting to Razorpay...</span>
          </>
        ) : checkoutSuccess ? (
          <>
            <CheckIcon size={18} />
            <span>Order Placed Successfully!</span>
          </>
        ) : (
          <>
            <LockIcon size={18} />
            <span>Pay with Razorpay</span>
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
          <span>256-Bit Encrypted Razorpay Checkout</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
