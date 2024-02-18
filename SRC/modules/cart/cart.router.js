import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { fileUpload } from "../../utilis/fileUpload.js";
import * as cartController from "./cart.controller.js"
import * as cartSchema from "./cart.schema.js"
const router = Router();

//API to add to cart
router.post("/",
    isAuthenticated,
    isAuthorized("user"),
    validation(cartSchema.addToCart),
    cartController.addToCart,  
);

//API to get user cart
router.get("/",
    isAuthenticated,
    isAuthorized("user", "admin"),
    validation(cartSchema.userCart),
    cartController.userCart
);

//API to update cart
router.patch("/",
    isAuthenticated,
    isAuthorized("user"),
    validation(cartSchema.updateCart),
    cartController.updateCart
);

//API to remove product from cart
router.patch("/:productId",
    isAuthenticated,
    isAuthorized("user"),
    validation(cartSchema.removeFromCart),
    cartController.removeFromCart
);


//API to clear cart
router.put("/clear",
    isAuthenticated,
    isAuthorized("user"),
    cartController.clearCart
);






export default router;



