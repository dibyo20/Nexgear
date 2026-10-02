import React from "react";
import { Link } from "react-router-dom";
import { CheckIcon, ArrowRightIcon, BoxIcon, ShieldIcon } from "../../Product/components/Icons.jsx";

export const PaymentSuccessModal = ({ isOpen, onClose, paymentDetails }) => {
  if (!isOpen || !paymentDetails) return null;

  const { orderId, paymentId, amount, currency = "INR" } = paymentDetails;

  const formatPrice = (val, curr = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: curr === "INR" ? "INR" : "USD",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="nex-modal-overlay" role="dialog" aria-modal="true">
      <div className="nex-modal-backdrop" onClick={onClose} />
      <div className="nex-payment-modal">
        {/* Glowing Success Ring */}
        <div className="nex-payment-success-icon">
          <div className="nex-icon-pulse" />
          <CheckIcon size={36} />
        </div>

        <span className="nex-payment-modal-badge">TRANSACTION VERIFIED</span>
        <h2 className="nex-payment-modal-title">Order Confirmed!</h2>
        <p className="nex-payment-modal-subtitle">
          Thank you for your purchase. Your precision mechanical instruments are being prepared for dispatch.
        </p>

        {/* Transaction Summary Card */}
        <div className="nex-payment-info-box">
          <div className="nex-payment-info-row">
            <span className="label">Order ID</span>
            <span className="value mono">{orderId || "N/A"}</span>
          </div>
          {paymentId && (
            <div className="nex-payment-info-row">
              <span className="label">Payment ID</span>
              <span className="value mono">{paymentId}</span>
            </div>
          )}
          <div className="nex-payment-info-row">
            <span className="label">Amount Paid</span>
            <span className="value highlight">{formatPrice(amount, currency)}</span>
          </div>
          <div className="nex-payment-info-row">
            <span className="label">Payment Method</span>
            <span className="value">Razorpay Secure Checkout</span>
          </div>
        </div>

        <div className="nex-modal-trust-note">
          <ShieldIcon size={16} />
          <span>A confirmation receipt has been dispatched to your registered email.</span>
        </div>

        {/* Actions */}
        <div className="nex-payment-modal-actions">
          <Link to="/" className="nex-btn-primary" onClick={onClose}>
            <span>Explore More Hardware</span>
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;
