import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useProduct } from "../hooks/useProduct.js";
import {
  ArrowLeftIcon,
  UploadIcon,
  PlusIcon,
  BoxIcon,
} from "../components/Icons.jsx";
import "../styles/CreateProduct.scss";

export const CreateProduct = () => {
  const navigate = useNavigate();
  const { handleCreateProduct, loading, error, clearProductError } =
    useProduct();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceAmount: "",
    priceCurrency: "INR",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (localError) setLocalError("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (selectedFiles.length + files.length > 5) {
      setLocalError("You can upload a maximum of 5 images.");
      return;
    }

    const newSelected = [...selectedFiles, ...files];
    setSelectedFiles(newSelected);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearProductError();
    setLocalError("");

    if (!formData.title.trim()) {
      setLocalError("Please provide a product title.");
      return;
    }

    if (!formData.description.trim()) {
      setLocalError("Please provide a product description.");
      return;
    }

    if (!formData.priceAmount || Number(formData.priceAmount) <= 0) {
      setLocalError("Please provide a valid price amount.");
      return;
    }

    if (selectedFiles.length === 0) {
      setLocalError("Please upload at least one product image.");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("priceAmount", formData.priceAmount);
    data.append("priceCurrency", formData.priceCurrency);

    selectedFiles.forEach((file) => {
      data.append("images", file);
    });

    const result = await handleCreateProduct(data);
    if (result.success) {
      const newId = result.data?.product?._id;
      if (newId) {
        navigate(`/seller/products/${newId}`);
      } else {
        navigate("/seller/dashboard");
      }
    }
  };

  const displayError = localError || error;

  return (
    <div className="nex-create-page">
      <Navbar />

      <main className="nex-create-main">
        <div className="nex-create-container">
          {/* Top Bar */}
          <div className="nex-create-topbar">
            <Link to="/seller/dashboard" className="nex-btn-back-dash">
              <ArrowLeftIcon size={16} />
              <span>Back to Studio Dashboard</span>
            </Link>
          </div>

          <div className="nex-create-card">
            <header className="nex-create-header">
              <div className="nex-create-icon-badge">
                <BoxIcon size={22} />
              </div>
              <div>
                <h1 className="nex-create-title">Publish New Instrument</h1>
                <p className="nex-create-subtitle">
                  List a new mechanical keyboard, desk accessory, or artisan component in the Nexgear ecosystem.
                </p>
              </div>
            </header>

            {displayError && (
              <div className="nex-create-error-banner" role="alert">
                <span>{displayError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="nex-create-form" noValidate>
              {/* Title */}
              <div className="nex-form-group">
                <label htmlFor="title" className="nex-form-label">
                  Product Name / Model
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Nexgear Vertex 65% Anodized Keyboard"
                  className="nex-form-input"
                  required
                />
              </div>

              {/* Description */}
              <div className="nex-form-group">
                <label htmlFor="description" className="nex-form-label">
                  Detailed Description & Specifications
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe materials, acoustics, PCB features, mounting style, and included accessories..."
                  className="nex-form-textarea"
                  rows={4}
                  required
                />
              </div>

              {/* Pricing Row */}
              <div className="nex-form-row">
                <div className="nex-form-group flex-2">
                  <label htmlFor="priceAmount" className="nex-form-label">
                    Base Price
                  </label>
                  <input
                    id="priceAmount"
                    type="number"
                    name="priceAmount"
                    value={formData.priceAmount}
                    onChange={handleChange}
                    placeholder="e.g. 14999"
                    min="1"
                    className="nex-form-input"
                    required
                  />
                </div>

                <div className="nex-form-group flex-1">
                  <label htmlFor="priceCurrency" className="nex-form-label">
                    Currency
                  </label>
                  <select
                    id="priceCurrency"
                    name="priceCurrency"
                    value={formData.priceCurrency}
                    onChange={handleChange}
                    className="nex-form-select"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              {/* Image Upload Zone */}
              <div className="nex-form-group">
                <label className="nex-form-label">
                  Product Images (Max 5 photos)
                </label>

                <div className="nex-upload-zone">
                  <input
                    type="file"
                    id="images"
                    name="images"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="nex-upload-input"
                    disabled={selectedFiles.length >= 5}
                  />
                  <label htmlFor="images" className="nex-upload-label">
                    <UploadIcon size={28} />
                    <span className="nex-upload-text">
                      Click to browse or drag & drop high-res images
                    </span>
                    <span className="nex-upload-hint">
                      PNG, JPG, WEBP up to 5MB each
                    </span>
                  </label>
                </div>

                {/* Previews */}
                {previewUrls.length > 0 && (
                  <div className="nex-preview-grid">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="nex-preview-item">
                        <img src={url} alt={`Upload ${index + 1}`} />
                        <button
                          type="button"
                          className="nex-preview-remove"
                          onClick={() => handleRemoveImage(index)}
                          aria-label="Remove image"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="nex-create-actions">
                <Link to="/seller/dashboard" className="nex-btn-cancel">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="nex-btn-submit-create"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner" />
                      <span>Publishing Instrument...</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon size={18} />
                      <span>Publish Product</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateProduct;
