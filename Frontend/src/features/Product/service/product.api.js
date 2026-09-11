import axios from "axios";

const productApiInstance = axios.create({
    baseURL: "/api/products",
    withCredentials: true,
});

export async function createProduct(formData) {
    const response = await productApiInstance.post("/", formData);
    return response.data;
}

export async function getSellerProducts() {
    const response = await productApiInstance.get("/seller");
    return response.data;
}

export async function getAllProducts() {
    const response = await productApiInstance.get("/");
    return response.data;
}

export async function getProductById(productId) {
    const response = await productApiInstance.get(`/details/${productId}`);
    return response.data;
}

export async function addProductVariant(productId, newProductVariant) {
    let payload = newProductVariant;

    if (!(newProductVariant instanceof FormData)) {
        const formData = new FormData();

        if (newProductVariant?.images && Array.isArray(newProductVariant.images)) {
            newProductVariant.images.forEach((image) => {
                if (image?.file) {
                    formData.append("images", image.file);
                } else if (image instanceof File || image instanceof Blob) {
                    formData.append("images", image);
                }
            });
        }

        if (newProductVariant?.stock !== undefined) {
            formData.append("stock", newProductVariant.stock);
        }
        if (newProductVariant?.priceAmount !== undefined) {
            formData.append("priceAmount", newProductVariant.priceAmount);
        }
        if (newProductVariant?.priceCurrency !== undefined) {
            formData.append("priceCurrency", newProductVariant.priceCurrency);
        }
        if (newProductVariant?.attributes !== undefined) {
            formData.append(
                "attributes",
                typeof newProductVariant.attributes === "string"
                    ? newProductVariant.attributes
                    : JSON.stringify(newProductVariant.attributes)
            );
        }

        payload = formData;
    }

    const response = await productApiInstance.post(`/${productId}/variants`, payload);
    return response.data;
}