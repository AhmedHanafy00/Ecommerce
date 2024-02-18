import joi from "joi"

//register Schema

export const register = joi.object({
    userName: joi.string().min(3).max(20).required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
}).
required();

//Activate Account Schema

export const activateAccount = joi.object({
    token : joi.string().required()
}).required();

//Login Schema

export const login = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
}).
required();

//Forget Code Schema

export const forgetCode = joi.object({
    email : joi.string().required(),
}).required();


//Reset Passwrod Schema

export const resetPassword = joi.object({
    email : joi.string().email().required(),
    forgetCode : joi.string().length(5).required(),
    password : joi.string().required(),
    confirmPassword : joi.string().valid(joi.ref("password")).required(),
}).required();