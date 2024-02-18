import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as orderController from "./order.controller.js"
import * as orderSchema from "./order.schema.js"
const router = Router();

//create orer
router.post("/",
    isAuthenticated,
    isAuthorized("user"),
    validation(orderSchema.createOrder),
    orderController.createOrder
)


//cancel order
router.patch("/:id",
    isAuthenticated,
    isAuthorized("user"),
    validation(orderSchema.cancelOrder),
    orderController.cancelOrder
)

export default router;