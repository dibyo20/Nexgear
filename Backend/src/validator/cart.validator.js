import { body, param, validationResult } from 'express-validator';

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            message: errors.array()[0]?.msg || "Validation error",
            errors: errors.array() 
        });
    }
    next();
}

export const validateAddToCart = [
    param("productId").isMongoId().withMessage("Invalid product id"),
    param("variantId").custom((val) => val === "default" || /^[0-9a-fA-F]{24}$/.test(val)).withMessage("Invalid variant id"),
    body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),

    validateRequest
]