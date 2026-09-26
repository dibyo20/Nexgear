import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        totalPrice: null,
        currency: null,
        loading: false,
        error: null,
    },
    reducers: {
        setCart: (state, action) => {
            const payload = action.payload || {};
            state.items = payload.items || (Array.isArray(payload) ? payload : []);
            state.totalPrice = payload.totalPrice ?? null;
            state.currency = payload.currency ?? null;
        },
        addItem: (state, action) => {
            state.items.push(action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        incrementCartItem: (state, action) => {
            const { productId, variantId } = action.payload;
            const targetVariantId = variantId ? String(variantId) : "default";

            state.items = state.items.map(item => {
                const itemProductId = item.product?._id ? String(item.product._id) : String(item.product);
                const itemVariantId = item.variant?._id ? String(item.variant._id) : (item.variant ? String(item.variant) : "default");
                if (itemProductId === String(productId) && itemVariantId === targetVariantId) {
                    return {
                        ...item,
                        quantity: (Number(item.quantity) || 0) + 1
                    };
                } else {
                    return item;
                }
            });
        },
        decrementCartItem: (state, action) => {
            const { productId, variantId } = action.payload;
            const targetVariantId = variantId ? String(variantId) : "default";

            state.items = state.items
                .map(item => {
                    const itemProductId = item.product?._id ? String(item.product._id) : String(item.product);
                    const itemVariantId = item.variant?._id ? String(item.variant._id) : (item.variant ? String(item.variant) : "default");
                    if (itemProductId === String(productId) && itemVariantId === targetVariantId) {
                        return {
                            ...item,
                            quantity: (Number(item.quantity) || 1) - 1
                        };
                    } else {
                        return item;
                    }
                })
                .filter(item => item.quantity > 0);
        }
    }
});

export const { setCart, addItem, setLoading, setError, clearError, incrementCartItem, decrementCartItem } = cartSlice.actions;

export default cartSlice.reducer;