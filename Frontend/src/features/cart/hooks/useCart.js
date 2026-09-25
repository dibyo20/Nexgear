import { useDispatch, useSelector } from "react-redux";
import {
  addItem as addItemToCart,
  setItems,
  setLoading,
  setError,
  clearError,
  incrementCartItem,
  decrementCartItem,
} from "../state/cart.slice.js";
import { addItem as addItemApi, getCart as getCartApi, increamentCartItemAPI, decreamentCartItemAPI } from "../service/cart.api.js";

export const useCart = () => {
  const dispatch = useDispatch();
  const { items = [], loading = false, error = null } = useSelector(
    (state) => state.cart || {}
  );

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
      if (data?.cart?.items) {
        dispatch(setItems(data.cart.items));
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
      if (data?.cart?.items) {
        dispatch(setItems(data.cart.items));
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
      if (data?.cart?.items) {
        dispatch(setItems(data.cart.items));
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

  const clearCartError = () => {
    dispatch(clearError());
  };

  const cartCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const cartTotal = items.reduce((acc, item) => {
    const prod = item.product;
    const varId = item.variant?._id || item.variant;
    let livePrice = null;
    if (prod && typeof prod === "object") {
      if (prod.variants && varId) {
        const v = prod.variants.find((v) => v._id?.toString() === varId.toString());
        if (v?.price?.amount !== undefined) livePrice = Number(v.price.amount);
      }
      if (livePrice === null && prod.price?.amount !== undefined) {
        livePrice = Number(prod.price.amount);
      }
    }
    const finalPrice = livePrice !== null ? livePrice : (Number(item.price?.amount) || 0);
    return acc + finalPrice * (item.quantity || 1);
  }, 0);

  const cartSavings = items.reduce((acc, item) => {
    const prod = item.product;
    const varId = item.variant?._id || item.variant;
    let livePrice = null;
    if (prod && typeof prod === "object") {
      if (prod.variants && varId) {
        const v = prod.variants.find((v) => v._id?.toString() === varId.toString());
        if (v?.price?.amount !== undefined) livePrice = Number(v.price.amount);
      }
      if (livePrice === null && prod.price?.amount !== undefined) {
        livePrice = Number(prod.price.amount);
      }
    }
    const origPrice = Number(item.price?.amount) || 0;
    if (livePrice !== null && origPrice > livePrice && livePrice > 0) {
      return acc + (origPrice - livePrice) * (item.quantity || 1);
    }
    return acc;
  }, 0);

  return {
    items,
    loading,
    error,
    cartCount,
    cartTotal,
    cartSavings,
    handleAddItem,
    handleGetCart,
    handleIncreamentCartItem,
    handleDecreamentCartItem,
    clearCartError,
  };
};