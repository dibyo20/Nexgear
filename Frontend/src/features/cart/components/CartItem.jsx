import React from "react";
import { Link } from "react-router-dom";
import { TrashIcon } from "../../Product/components/Icons.jsx";

export const CartItem = ({
  item,
  updatingKey,
  loading,
  onIncrement,
  onDecrement,
  formatPrice,
}) => {
  const prod = item.product || {};
  const prodId = prod._id || prod;
  const varId = item.variant?._id || item.variant;

  let variantObj = null;
  if (Array.isArray(prod.variants) && varId) {
    variantObj = prod.variants.find(
      (v) => v?._id?.toString() === varId.toString()
    );
  } else if (prod.variants && typeof prod.variants === "object" && !Array.isArray(prod.variants)) {
    variantObj = prod.variants;
  }

  const originalUnitPrice = Number(item.price?.amount) || 0;
  const currentUnitPrice = Number(
    variantObj?.price?.amount ?? prod.price?.amount ?? originalUnitPrice
  ) || 0;

  const currency =
    variantObj?.price?.currency ||
    prod.price?.currency ||
    item.price?.currency ||
    "INR";

  const quantity = Number(item.quantity) || 1;
  const lineTotal = currentUnitPrice * quantity;

  const hasSavings = originalUnitPrice > currentUnitPrice && currentUnitPrice > 0;
  const unitSavings = hasSavings ? originalUnitPrice - currentUnitPrice : 0;
  const totalItemSavings = unitSavings * quantity;

  const isPriceIncreased = currentUnitPrice > originalUnitPrice && originalUnitPrice > 0;
  const priceIncreaseDiff = isPriceIncreased ? currentUnitPrice - originalUnitPrice : 0;

  const itemImg =
    variantObj?.images?.[0]?.url ||
    variantObj?.images?.[0] ||
    prod.images?.[0]?.url ||
    prod.images?.[0] ||
    "/assets/login-keyboard.jpg";

  const itemKey = `${prodId}-${varId || "default"}`;
  const isItemUpdating = updatingKey === itemKey;

  return (
    <div className="nex-cart-card">
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

      <div className="nex-cart-info">
        <Link to={`/products/${prodId}`} className="nex-cart-item-title">
          {prod.title || "Custom Mechanical Instrument"}
        </Link>

        {variantObj?.attributes && Object.keys(variantObj.attributes instanceof Map ? Object.fromEntries(variantObj.attributes) : variantObj.attributes).length > 0 ? (
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
        ) : (
          <div className="nex-cart-variant-badges">
            <span className="nex-cart-spec-badge">Standard Base Edition</span>
          </div>
        )}

        <div className="nex-cart-price-block">
          <div className="nex-cart-unit-price">
            <span className="nex-cart-price-lbl">Unit Price: </span>
            {hasSavings ? (
              <>
                <span className="nex-cart-old-price">
                  {formatPrice(originalUnitPrice, currency)}
                </span>
                <span className="nex-cart-current-price live-drop">
                  {formatPrice(currentUnitPrice, currency)}
                </span>
              </>
            ) : isPriceIncreased ? (
              <>
                <span className="nex-cart-current-price live-increase">
                  {formatPrice(currentUnitPrice, currency)}
                </span>
                <span className="nex-cart-bump-pill">
                  Updated (+{formatPrice(priceIncreaseDiff, currency)})
                </span>
              </>
            ) : (
              <span className="nex-cart-current-price">
                {formatPrice(currentUnitPrice, currency)}
              </span>
            )}
            <span className="nex-cart-each-lbl"> each</span>
          </div>

          {hasSavings && (
            <div className="nex-cart-savings-banner">
              <span>
                You can buy it for{" "}
                <strong className="deal-buy-price">
                  {formatPrice(currentUnitPrice, currency)}
                </strong>{" "}
                and you can save{" "}
                <strong className="deal-save-price">
                  {formatPrice(unitSavings, currency)}
                </strong>
              </span>
              {quantity > 1 && (
                <span className="nex-cart-total-savings-tag">
                  (Save {formatPrice(totalItemSavings, currency)} total)
                </span>
              )}
            </div>
          )}

          {isPriceIncreased && (
            <div className="nex-cart-notice-banner">
              <span>
                [Notice] Seller updated price from{" "}
                <span className="strike">
                  {formatPrice(originalUnitPrice, currency)}
                </span>{" "}
                to {formatPrice(currentUnitPrice, currency)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="nex-cart-qty-ctrl">
        <button
          type="button"
          onClick={() => onDecrement(prodId, varId, itemKey)}
          disabled={loading || isItemUpdating}
          aria-label={item.quantity <= 1 ? "Remove item" : "Decrease quantity"}
          title={item.quantity <= 1 ? "Remove item" : "Decrease quantity"}
        >
          {item.quantity <= 1 ? <TrashIcon size={14} /> : "−"}
        </button>
        <span className="nex-cart-qty-value">{item.quantity || 1}</span>
        <button
          type="button"
          onClick={() => onIncrement(prodId, varId, itemKey)}
          disabled={loading || isItemUpdating}
          aria-label="Increase quantity"
          title="Increase quantity"
        >
          +
        </button>
      </div>

      <div className="nex-cart-actions-col">
        <div className="nex-cart-item-total">
          {formatPrice(lineTotal, currency)}
        </div>
        <button
          type="button"
          className="nex-cart-remove-btn"
          onClick={() => onDecrement(prodId, varId, itemKey)}
          disabled={loading || isItemUpdating}
          title="Remove item"
          aria-label="Remove item"
        >
          <TrashIcon size={16} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
