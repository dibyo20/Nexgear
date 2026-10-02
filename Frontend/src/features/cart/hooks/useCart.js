import { useDispatch, useSelector } from "react-redux";
import {
  addItem as addItemToCart,
  setCart,
  setLoading,
  setError,
  clearError,
  clearCart,
  incrementCartItem,
  decrementCartItem,
} from "../state/cart.slice.js";
import {
  addItem as addItemApi,
  getCart as getCartApi,
  increamentCartItemAPI,
  decreamentCartItemAPI,
  createPaymentOrderAPI,
  verifyPaymentOrderAPI,
} from "../service/cart.api.js";

export const useCart = () => {
  const dispatch = useDispatch();
  const {
    items = [],
    totalPrice = null,
    currency = null,
    loading = false,
    error = null,
  } = useSelector((state) => state.cart || {});

  async function handleAddItem({ productId, variantId, quantity = 1 }) {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const data = await addItemApi({ productId, variantId, quantity });
      dispatch(addItemToCart({ productId, variantId, quantity }));
      await handleGetCart();
      return data;
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetCart() {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const data = await getCartApi();
      if (data?.cart) {
        dispatch(setCart(data.cart));
      }
      return data;
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleIncreamentCartItem({ productId, variantId }) {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const data = await increamentCartItemAPI({ productId, variantId });
      if (data?.cart) {
        dispatch(setCart(data.cart));
      } else {
        dispatch(incrementCartItem({ productId, variantId }));
      }
      return data;
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleDecreamentCartItem({ productId, variantId }) {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const data = await decreamentCartItemAPI({ productId, variantId });
      if (data?.cart) {
        dispatch(setCart(data.cart));
      } else {
        dispatch(decrementCartItem({ productId, variantId }));
      }
      return data;
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleCreatePaymentOrder() {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const data = await createPaymentOrderAPI();
      return data;
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleVerifyPaymentOrder({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const data = await verifyPaymentOrderAPI({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
      dispatch(clearCart());
      return data;
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const clearCartError = () => {
    dispatch(clearError());
  };

  const cartCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const getItemLivePrice = (item) => {
    const prod = item?.product;
    const varId = item?.variant?._id || item?.variant;
    if (prod && typeof prod === "object") {
      if (Array.isArray(prod.variants) && varId) {
        const v = prod.variants.find((v) => v?._id?.toString() === varId.toString());
        if (v?.price?.amount !== undefined) return Number(v.price.amount);
      } else if (prod.variants?.price?.amount !== undefined) {
        return Number(prod.variants.price.amount);
      }
      if (prod.price?.amount !== undefined) return Number(prod.price.amount);
    }
    return Number(item?.price?.amount) || 0;
  };

  const fallbackTotal = items.reduce((acc, item) => {
    return acc + getItemLivePrice(item) * (item.quantity || 1);
  }, 0);

  const cartTotal = totalPrice !== null && totalPrice !== undefined ? totalPrice : fallbackTotal;

  const cartSavings = items.reduce((acc, item) => {
    const livePrice = getItemLivePrice(item);
    const origPrice = Number(item.price?.amount) || 0;
    if (origPrice > livePrice && livePrice > 0) {
      return acc + (origPrice - livePrice) * (item.quantity || 1);
    }
    return acc;
  }, 0);

  return {
    items,
    totalPrice,
    currency,
    loading,
    error,
    cartCount,
    cartTotal,
    cartSavings,
    handleAddItem,
    handleGetCart,
    handleIncreamentCartItem,
    handleDecreamentCartItem,
    handleCreatePaymentOrder,
    handleVerifyPaymentOrder,
    handleClearCart,
    clearCartError,
  };
};