import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload } from "../../utilis/fileUpload.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as categortController from "./category.controller.js"
import * as categorySchema from "./category.schema.js"
import subcategoryRouter from "./../subcategory/subcategory.router.js"
const router = Router();

//API to link with subcategory
router.use("/:category/subcategory", subcategoryRouter)

//API to create category

router.post("/", isAuthenticated,
    isAuthorized("admin"),
    fileUpload().single("category"),
    validation(categorySchema.createCategory),
    categortController.createCategory
); //fileUpload before validation cuz of PARSING


//API to Upgrade category

router.patch("/:id", isAuthenticated,
    isAuthorized("admin"),
    fileUpload().single("category"),
    validation(categorySchema.updateCategory),
    categortController.updateCategory
);


//API to Delete category

router.delete("/:id", isAuthenticated,
    isAuthorized("admin"),
    validation(categorySchema.deleteCategory),
    categortController.deleteCategory
);

//API to get all Categories

router.get("/", categortController.allCategories)

export default router;