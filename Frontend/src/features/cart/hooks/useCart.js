import { useDispatch, useSelector } from "react-redux";
import { addItem as addItemToCart, setItems } from "../state/cart.slice";
import { addItem as addItemApi } from "../service/cart.api";
import { getCart } from "../service/cart.api";

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleAddItem({ productId, variantId }) {
        const data = await addItemApi({ productId, variantId })
        dispatch(addItemToCart({ productId, variantId }))

        return data
    }

    async function handleGetCart() {
        const data = await getCart();
        dispatch(setItems(data.cart.items));
    }

    return {
        handleAddItem,
        handleGetCart
    }
}