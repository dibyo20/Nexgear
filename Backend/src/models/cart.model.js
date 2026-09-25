import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        unique: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            variant: {
                type: mongoose.Schema.Types.ObjectId,
            },
            quantity: {
                type: Number,
                min: 1,
                default: 1
            },
            price: {
                type: priceSchema,
                required: true
            }
        }
    ]
}, { timestamps: true });

const cartModel = mongoose.model('cart', cartSchema);

export default cartModel;