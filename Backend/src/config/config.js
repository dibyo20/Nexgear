import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGO_URI) {
    throw new Error("Please set your MONGO_URI environment variables");
}

if (!process.env.JWT_SECRET) {
    throw new Error("Please set your JWT_SECRET environment variables");
}

if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Please set your GOOGLE_CLIENT_ID environment variables");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Please set your GOOGLE_CLIENT_SECRET environment variables");
}

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("Please set your IMAGEKIT_PRIVATE_KEY environment variables");
}

if (!process.env.RAZORPAY_KEY_ID) {
    throw new Error("Please set your RAZORPAY_KEY_ID environment variables");
}

if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Please set your RAZORPAY_KEY_SECRET environment variables");
}

if (!process.env.REDIS_URI) {
    throw new Error("Please set your REDIS_URI environment variables")
}

export const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NODE_ENV: process.env.NODE_ENV || "development",
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    REDIS_URI: process.env.REDIS_URI,
};