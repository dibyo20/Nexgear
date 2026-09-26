import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";
import { stockOfVariant } from "../dao/product.dao.js";
import mongoose from "mongoose";

export const addToCart = async (req, res) => {
    try {
        const { productId, variantId } = req.params;
        const quantity = req.body.quantity ? Number(req.body.quantity) : 1;

        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const stock = (await stockOfVariant(productId, variantId)) ?? 10;

        const cart = (await cartModel.findOne({ user: req.user._id })) || (await cartModel.create({ user: req.user._id }));

        const isProductAlreadyInCart = cart.items.some(
            item => item.product.toString() === productId && (item.variant?.toString() === variantId || (!item.variant && variantId === "default"))
        );

        if (isProductAlreadyInCart) {
            const existingItem = cart.items.find(
                item => item.product.toString() === productId && (item.variant?.toString() === variantId || (!item.variant && variantId === "default"))
            );
            const quantityInCart = existingItem.quantity;
            if (quantity + quantityInCart > stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${stock - quantityInCart} items left in stock`
                });
            }

            await cartModel.findOneAndUpdate(
                {
                    user: req.user._id,
                    "items.product": productId,
                    ...(variantId && variantId !== "default"
                        ? { "items.variant": variantId }
                        : { "items.variant": { $in: [null, undefined] } })
                },
                { $inc: { "items.$.quantity": quantity } },
                { new: true }
            );

            return res.status(200).json({
                success: true,
                message: "Item added to cart"
            });
        }

        if (quantity > stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${stock} items left in stock`
            });
        }

        const variant = product.variants?.find(v => v._id.toString() === variantId);

        const item = {
            product: productId,
            variant: variant ? variantId : undefined,
            quantity,
            price: {
                amount: variant?.price?.amount || product.price?.amount || 0,
                currency: variant?.price?.currency || product.price?.currency || "INR"
            }
        };

        cart.items.push(item);
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Item added to cart"
        });
    } catch (error) {
        console.error("Error in addToCart:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to add item to cart"
        });
    }
};

export const getCart = async (req, res) => {
    try {
        const user = req.user;
        let cart = await cartModel.findOne({ user: user._id }).aggregate(
            [
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(user._id)
                    }
                },
                { $unwind: { path: '$items' } },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'items.product',
                        foreignField: '_id',
                        as: 'items.product'
                    }
                },
                { $unwind: { path: '$items.product' } },
                {
                    $unwind: { path: '$items.product.variants' }
                },
                {
                    $match: {
                        $expr: {
                            $eq: [
                                '$items.variant',
                                '$items.product.variants._id'
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        itemPrice: {
                            price: {
                                $multiply: [
                                    '$items.quantity',
                                    '$items.product.variants.price.amount'
                                ]
                            },
                            currency:
                                '$items.product.variants.price.currency'
                        }
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        totalPrice: { $sum: '$itemPrice.price' },
                        currency: {
                            $first: '$itemPrice.currency'
                        },
                        items: { $push: '$items' }
                    }
                }
            ]
        );

        if (!cart) {
            cart = await cartModel.create({ user: user._id });
        }

        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            cart
        });
    } catch (error) {
        console.error("Error in getCart:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch cart"
        });
    }
};

export const incrementCartItemQuantity = async (req, res) => {
    try {
        const { productId, variantId } = req.params;
        const isDefault = !variantId || variantId === "default";

        const product = isDefault
            ? await productModel.findById(productId)
            : await productModel.findOne({
                _id: productId,
                "variants._id": variantId
            });

        if (!product) {
            return res.status(404).json({
                message: "Product or variant not found",
                success: false
            });
        }

        const cart = await cartModel.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false
            });
        }

        const stock = (await stockOfVariant(productId, variantId)) ?? 10;
        const itemQuantityInCart = cart.items.find(item =>
            item.product.toString() === productId &&
            (item.variant?.toString() === variantId || (!item.variant && isDefault))
        )?.quantity || 0;

        if (itemQuantityInCart + 1 > stock) {
            return res.status(400).json({
                message: `Only ${stock} items left in stock and you already have ${itemQuantityInCart} items in your cart.`,
                success: false
            });
        }

        const query = {
            user: req.user._id,
            "items.product": productId,
            ...(isDefault
                ? { "items.variant": { $in: [null, undefined] } }
                : { "items.variant": variantId })
        };

        await cartModel.findOneAndUpdate(
            query,
            { $inc: { "items.$.quantity": 1 } },
            { new: true }
        );

        const updatedCart = await cartModel.findOne({ user: req.user._id }).populate("items.product");

        return res.status(200).json({
            success: true,
            message: "Item quantity incremented successfully",
            cart: updatedCart
        });
    } catch (error) {
        console.error("Error in incrementCartItemQuantity:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to increment item quantity"
        });
    }
};

export const decrementCartItemQuantity = async (req, res) => {
    try {
        const { productId, variantId } = req.params;
        const isDefault = !variantId || variantId === "default";

        const product = isDefault
            ? await productModel.findById(productId)
            : await productModel.findOne({
                _id: productId,
                "variants._id": variantId
            });

        if (!product) {
            return res.status(404).json({
                message: "Product or variant not found",
                success: false
            });
        }

        const cart = await cartModel.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false
            });
        }

        const itemInCart = cart.items.find(
            item => item.product.toString() === productId &&
                (item.variant?.toString() === variantId || (!item.variant && isDefault))
        );

        if (!itemInCart) {
            return res.status(404).json({
                message: "Item not found in cart",
                success: false
            });
        }

        if (itemInCart.quantity <= 1) {
            if (isDefault) {
                await cartModel.findOneAndUpdate(
                    { user: req.user._id },
                    { $pull: { items: { product: productId, variant: { $in: [null, undefined] } } } },
                    { new: true }
                );
            } else {
                await cartModel.findOneAndUpdate(
                    { user: req.user._id },
                    { $pull: { items: { product: productId, variant: variantId } } },
                    { new: true }
                );
            }
        } else {
            const query = {
                user: req.user._id,
                "items.product": productId,
                ...(isDefault
                    ? { "items.variant": { $in: [null, undefined] } }
                    : { "items.variant": variantId })
            };

            await cartModel.findOneAndUpdate(
                query,
                { $inc: { "items.$.quantity": -1 } },
                { new: true }
            );
        }

        const updatedCart = await cartModel.findOne({ user: req.user._id }).populate("items.product");

        return res.status(200).json({
            success: true,
            message: "Item quantity decremented successfully",
            cart: updatedCart
        });
    } catch (error) {
        console.error("Error in decrementCartItemQuantity:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to decrement item quantity"
        });
    }
};