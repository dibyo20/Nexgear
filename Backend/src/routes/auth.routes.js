import { Router } from "express";
import { register, googleCallback, login, getMe, logout } from "../controllers/auth.controller.js";
import { validateRegisterUser } from "../validator/auth.validator.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import passport from "passport";
import { config } from "../config/config.js";

const router = Router();

router.post("/register", validateRegisterUser, register);
router.post("/login", login);
router.get("/me", authenticateUser, getMe);
router.post("/logout", logout);

router.get("/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback", passport.authenticate("google", {
    session: false,
    failureRedirect: config.FRONTEND_URL ? `${config.FRONTEND_URL}/login` : "http://localhost:5173/login"
}),
    googleCallback
);

export default router;