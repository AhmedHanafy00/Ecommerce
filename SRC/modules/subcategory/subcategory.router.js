import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload } from "../../utilis/fileUpload.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as subcategortController from "./subcategory.controller.js"
import * as subcategorySchema from "./subcategory.schema.js"
const router = Router({ mergeParams: true });

//API to create subcategory

router.post("/", isAuthenticated,
    isAuthorized("admin"),
    fileUpload().single("subcategory"),
    validation(subcategorySchema.createSubcategory),
    subcategortController.createSubcategory
); //fileUpload before validation cuz of PARSING

//API to update subcategory

router.patch("/:id", isAuthenticated,
    isAuthorized("admin"),
    fileUpload().single("subcategory"),
    validation(subcategorySchema.updateSubcategory),
    subcategortController.updateSubcategory
);

//API to Delete subcategory

router.delete("/:id", isAuthenticated,
    isAuthorized("admin"),
    validation(subcategorySchema.deleteSubcategory),
    subcategortController.deleteSubcategory
);

//API to get all subcategories

router.get("/",validation(subcategorySchema.getSubcategories),subcategortController.getSubcategories);

export default router;