import axios from "axios";

const cartApiInstance = axios.create({
    baseURL: "/api/cart",
    withCredentials: true,
});

export const addItem = async ({ productId, variantId, quantity = 1 }) => {
    const response = await cartApiInstance.post(`add/${productId}/${variantId}`, {
        quantity
    });
    return response.data;
}

export const getCart = async () => {
    const response = await cartApiInstance.get('/');
    return response.data;
}

export const increamentCartItemAPI = async ({ productId, variantId }) => {
    const response = await cartApiInstance.post(`/quantity/increment/${productId}/${variantId}`);
    return response.data;
}

export const decreamentCartItemAPI = async ({ productId, variantId }) => {
    const response = await cartApiInstance.post(`/quantity/decrement/${productId}/${variantId}`);
    return response.data;
}