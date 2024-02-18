import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { fileUpload } from "../../utilis/fileUpload.js";
import * as productController from "./product.controller.js"
import * as productSchema from "./product.schema.js"
import reviewRouter from "./../review/review.router.js"
const router = Router();

router.use("/:productId/review", reviewRouter)

//API to create product

router.post("/",
    isAuthenticated,
    isAuthorized("seller"),
    fileUpload().fields([
        { name: "defaultImage", maxCount: 1 },
        { name: "subImages", maxCount: 3 }
    ]),
    validation(productSchema.createProduct),
    productController.createProduct
);

//API to delete product

router.delete("/:id",
    isAuthenticated,
    isAuthorized("seller"),
    validation(productSchema.deleteProduct),
    productController.deleteProduct
);

//API to get products

router.get("/",
    productController.allProducts
)

export default router;