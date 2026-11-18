import { config } from "../config/config.js";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import redis from "../config/cache.js";

async function sendTokenResponse(user, res, message) {
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
        message,
        success: true,
        user: {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            contact: user.contact,
            role: user.role
        }
    });
}

export const register = async (req, res) => {
    const { email, contact, password, fullname, isSeller } = req.body;

    try {
        const query = contact ? { $or: [{ email }, { contact }] } : { email };
        const existingUser = await userModel.findOne(query);
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await userModel.create({
            email,
            contact: contact || undefined,
            password,
            fullname,
            role: isSeller ? "seller" : "buyer"
        });

        await sendTokenResponse(user, res, "User registered successfully");
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const googleCallback = async (req, res) => {
    const { id, displayName, emails, photos } = req.user;

    const email = emails[0].value;
    const profilePic = photos[0].value;

    let user = await userModel.findOne({ email });

    if (!user) {
        user = await userModel.create({
            email,
            googleId: id,
            fullname: displayName,
        });
    }

    const token = jwt.sign(
        { id: user._id },
        config.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    });

    const redirectUrl = config.FRONTEND_URL ? `${config.FRONTEND_URL}/` : "http://localhost:5173/";
    res.redirect(redirectUrl);
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const tokenCookie = req.cookies?.token;
        if (tokenCookie) {
            const blackListedToken = await redis.get(`blacklist:${tokenCookie}`);

            if (blackListedToken) {
                return res.status(401).json({ message: "Unauthorized (Token is blacklisted)" });
            }
        }

        await sendTokenResponse(user, res, "Login Successful");
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

export const getMe = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                contact: user.contact,
                role: user.role,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).json({ message: "Token not provided" });
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: config.NODE_ENV === "production" ? "none" : "lax",
        });

        await redis.set(`blacklist:${token}`, "blacklisted", "EX", 24 * 60 * 60);

        res.status(200).json({
            message: "Logout Successfull",
            token: token,
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};
