import jwt from 'jsonwebtoken';
import { config } from "../config/config.js";
import userModel from "../models/user.model.js";
import redis from "../config/cache.js";

export const authenticateUser = async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
        const isBlacklisted = await redis.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ message: "Unauthorized (Token is blacklisted)" });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ message: "Not authenticated" });
    }
};

export const authenticateSeller = async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
        const isBlacklisted = await redis.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ message: "Unauthorized (Token is blacklisted)" });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        if (user.role !== "seller") {
            return res.status(403).json({ message: "Forbidden" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ message: "Not authenticated" });
    }
};