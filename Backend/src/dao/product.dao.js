import productModel from "../models/product.model.js";

export const stockOfVariant = async (productId, variantId) => {
    if (!variantId || variantId === "default") {
        const product = await productModel.findById(productId);
        if (!product) {
            return null;
        }
        return product.stock ?? 10;
    }

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId,
    });

    if (!product) {
        return null;
    }

    const variant = product.variants.find((variant) => variant._id.toString() === variantId.toString());

    return variant ? variant.stock : null;
}