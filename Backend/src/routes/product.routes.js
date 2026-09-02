import { Router } from "express";
import multer from "multer";
import { authenticateSeller } from "../middlewares/auth.middleware";
import { createProduct, getSellerProducts, getAllProducts, getProductDetails, addProductVariant } from "../controllers/product.controller";
import { createProductValidator } from "../validator/product.validator.js";

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 5 }
});

/**
 * @route POST /api/products
 * @description Create a new product
 * @access Private 
 */
router.post("/", authenticateSeller, upload.array("images", 5), createProductValidator, createProduct);

/**
 * @route GET /api/products/seller
 * @desc   Get all products of a seller
 * @access Private
 */
router.get("/seller", authenticateSeller, getSellerProducts);

/**
 * @route GET /api/products
 * @desc   Get all products
 * @access Public
 */
router.get("/", getAllProducts);

/**
 * @route GET /api/products/details/:id
 * @desc   Get product details by Id
 * @access Public
 */
router.get("/details/:id", getProductDetails);

export default router;

