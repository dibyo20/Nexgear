import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "./Icons.jsx";
import "../styles/ProductCard.scss";

export const ProductCard = ({ product }) => {
  if (!product) return null;

  const imageUrl =
    product.images?.[0]?.url ||
    product.images?.[0] ||
    "/assets/login-keyboard.jpg";

  const priceAmount = product.price?.amount || 0;
  const priceCurrency = product.price?.currency || "INR";
  const variantsCount = product.variants?.length || 0;

  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency === "INR" ? "INR" : "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <article className="nex-card">
      <Link to={`/products/${product._id}`} className="nex-card__media-link">
        <div className="nex-card__media">
          <img
            src={imageUrl}
            alt={product.title}
            className="nex-card__image"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/assets/login-keyboard.jpg";
            }}
          />
          <div className="nex-card__overlay-gradient" />
          
          {variantsCount > 0 && (
            <span className="nex-card__badge-variant">
              {variantsCount} {variantsCount === 1 ? "Variant" : "Variants"}
            </span>
          )}
        </div>
      </Link>

      <div className="nex-card__body">
        <div className="nex-card__header">
          <h3 className="nex-card__title">
            <Link to={`/products/${product._id}`}>{product.title}</Link>
          </h3>
          <p className="nex-card__desc">{product.description}</p>
        </div>

        <div className="nex-card__footer">
          <div className="nex-card__price-box">
            <span className="nex-card__price-label">Starting at</span>
            <span className="nex-card__price">
              {formatPrice(priceAmount, priceCurrency)}
            </span>
          </div>

          <Link
            to={`/products/${product._id}`}
            className="nex-card__action-btn"
            aria-label={`View details for ${product.title}`}
          >
            <span>Specs</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
