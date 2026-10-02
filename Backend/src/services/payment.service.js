import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../config/config.js";

const razorpay = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET
});

export const createOrder = async ({ amount, currency = "INR" }) => {
    const options = {
        amount: Math.round(Number(amount) * 100),
        currency: currency || "INR"
    };

    const order = await razorpay.orders.create(options);
    return order;
};

export const verifyPaymentSignature = ({ order_id, payment_id, signature }) => {
    if (!order_id || !payment_id || !signature) {
        return false;
    }
    const expectedSignature = crypto
        .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
        .update(`${order_id}|${payment_id}`)
        .digest("hex");

    return expectedSignature === signature;
};