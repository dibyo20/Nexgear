import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { addToCart } from '../controllers/cart.controller.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', addToCart);

export default router;
