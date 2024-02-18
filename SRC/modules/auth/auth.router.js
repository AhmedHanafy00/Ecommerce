import { Router } from "express";
import { validation } from "./../../middleware/validation.middleware.js"
import * as authController from "./auth.controller.js"
import * as authSchema from "./auth.schema.js"

const router = Router()


//Register API
router.post(
    "/register",
    validation(authSchema.register),
    authController.register
);

//Activate Account API
router.get(
    "/activate_account/:token",
    validation(authSchema.activateAccount),
    authController.activateAccount
    );

//Login API 
router.post("/login",validation(authSchema.login),authController.login)

//send the "forget Code" API
router.patch("/forgetCode",validation(authSchema.forgetCode),authController.forgetCode)

//reset password API

router.patch("/resetPassword",validation(authSchema.resetPassword),authController.resetPassword)

export default router;