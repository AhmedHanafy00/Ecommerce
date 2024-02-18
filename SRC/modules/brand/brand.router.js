import { Router } from "express";
import * as brandController from "./brand.controller.js";
import * as brandSchema from "./brand.schema.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload } from "../../utilis/fileUpload.js";
import { validation } from "../../middleware/validation.middleware.js";
const router = Router();

//API to create brand

router.post("/",
    isAuthenticated,
    isAuthorized("admin"),
    fileUpload().single("brand"),
    validation(brandSchema.createBrand),
    brandController.createBrand
);

//API to Update brand

router.patch("/:id",
    isAuthenticated,
    isAuthorized("admin"),
    fileUpload().single("brand"),
    validation(brandSchema.updateBrand),
    brandController.updateBrand
);


//API to Delete brand

router.delete("/:id",
    isAuthenticated,
    isAuthorized("admin"),
    validation(brandSchema.deleteBrand),
    brandController.deleteBrand
);

//API to get Brands

router.get("/", brandController.getBrand);

export default router;