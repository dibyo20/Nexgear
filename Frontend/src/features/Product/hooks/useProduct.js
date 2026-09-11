import { useDispatch, useSelector } from "react-redux";
import {
    addProductVariant,
    createProduct,
    getAllProducts,
    getProductById,
    getSellerProducts,
} from "../service/product.api.js";
import {
    clearError,
    setError,
    setLoading,
    setProducts,
    setSellerProducts,
} from "../state/product.slice.js";

export const useProduct = () => {
    const dispatch = useDispatch();
    const {
        products = [],
        sellerProducts = [],
        loading = false,
        error = null,
    } = useSelector((state) => state.product || {});

    async function handleCreateProduct(formData) {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await createProduct(formData);
            dispatch(setLoading(false));
            return { success: true, data };
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create product. Please try again.";
            dispatch(setError(message));
            dispatch(setLoading(false));
            return { success: false, error: message };
        }
    }

    async function handleGetSellerProduct() {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await getSellerProducts();
            dispatch(setSellerProducts(data.products));
            dispatch(setLoading(false));
            return { success: true, data };
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to fetch seller products. Please try again.";
            dispatch(setError(message));
            dispatch(setLoading(false));
            return { success: false, error: message };
        }
    }

    async function handleGetAllProducts() {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await getAllProducts();
            dispatch(setProducts(data.products));
            dispatch(setLoading(false));
            return { success: true, data };
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to fetch products. Please try again.";
            dispatch(setError(message));
            dispatch(setLoading(false));
            return { success: false, error: message };
        }
    }

    async function handleGetProductById(productId) {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await getProductById(productId);
            dispatch(setLoading(false));
            return { success: true, data };
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to fetch product details. Please try again.";
            dispatch(setError(message));
            dispatch(setLoading(false));
            return { success: false, error: message };
        }
    }

    async function handleAddProductVariant(productId, newProductVariant) {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await addProductVariant(productId, newProductVariant);
            dispatch(setLoading(false));
            return { success: true, data };
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to add product variant. Please try again.";
            dispatch(setError(message));
            dispatch(setLoading(false));
            return { success: false, error: message };
        }
    }

    const clearProductError = () => {
        dispatch(clearError());
    };

    return {
        products,
        sellerProducts,
        loading,
        error,
        handleCreateProduct,
        handleGetSellerProduct,
        handleGetSellerProducts: handleGetSellerProduct,
        handleGetAllProducts,
        handleGetProductById,
        handleAddProductVariant,
        clearProductError,
    };
};