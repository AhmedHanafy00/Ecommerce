import { asyncHandler } from "../../utilis/asyncHandler.js";
import { User } from "./../../../DB/models/user.model.js";
import { Token } from "./../../../DB/models/token.model.js"
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken"
import { sendEmail } from "./../../utilis/sendEmails.js"
import { resetPassTemp, signUpTemp } from "./../../utilis/htmlTemplates.js";
import Randomstring from "randomstring";
import { Cart } from "../../../DB/models/cart.model.js";

// register controller

export const register = asyncHandler(async (req, res, next) => {
    //data from request
    const { email, userName, password } = req.body

    //check user existence
    const user = await User.findOne({ email });
    if (user) return next(new Error("User already exists", { cause: 409 }));

    //generate token
    const token = jwt.sign({ email }, process.env.TOKEN_SECRET)

    //create user
    await User.create({ ...req.body });

    //create confirmation link
    const confirmationLink = `http://localhost:4000/auth/activate_account/${token}`;

    //send email
    const messageSent = await sendEmail({
        to: email,
        subject: "Activate Account",
        html: signUpTemp(confirmationLink),
    });

    if (!messageSent) return next(new Error("Something Went Wrong!!"));

    //send response
    return res.json({ success: true, messgae: "Activate your account" });
});

//activate account controller

export const activateAccount = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    const { email } = jwt.verify(token, process.env.TOKEN_SECRET);

    //find user , update isConfirmed 
    const user = await User.findOneAndUpdate({ email }, { isConfirmed: true });

    //check if the user doesn't exist
    if (!user) return next(new Error("User not found!", { cause: 404 }));

    //create a cart  
    await Cart.create({ user: user._id })

    //send response 
    return res.json({ success: true, message: "Please, login now!" });
});

//Login controller

export const login = asyncHandler(async (req, res, next) => {
    //data from request
    const { email, password } = req.body;
    //check user existence
    const user = await User.findOne({ email });
    if (!user) return next(new Error("Invalid Email", { cause: 404 }));
    //check isConfirmed
    if (!user.isConfirmed) return next(new Error("Activate your account first!"));
    //check token
    const match = bcryptjs.compareSync(password, user.password)
    if (!match) return next(new Error("Invalid Password!"));
    //generate token
    const token = jwt.sign({ email, id: user._id }, process.env.TOKEN_SECRET);
    //save token in token model
    await Token.create({ token, user: user._id });
    //send response
    return res.json({ success: true, results: { token } });
});


//Forget Code Controller

export const forgetCode = asyncHandler(async (req, res, next) => {
    //data from request
    const { email } = req.body;

    //check user existence
    const user = await User.findOne({ email });
    if (!user) return next(new Error("Invalid Email", { cause: 404 }));

    //generate forget code
    const forgetCode = Randomstring.generate({
        charset: "numeric",
        length: 5,
    });

    //save forget code to user
    user.forgetCode = forgetCode;
    await user.save();

    //send email
    const messageSent = await sendEmail({
        to: email,
        subject: "Reset Password",
        html: resetPassTemp(forgetCode),
    });
    if (!messageSent) return next(new Error("Error occurred!!"));

    //send response
    return res.json({ success: true, message: "Check your Email please.." });
});


//Reset Password Controller

export const resetPassword = asyncHandler(async (req, res, next) => {

    //data from request
    const { email, password, forgetCode } = req.body;

    //check user existence
    const user = await User.findOne({ email });
    if (!user) return next(new Error("Invalid Email", { cause: 404 }));

    //check forget code
    if (forgetCode !== user.forgetCode)
        return next(new Error("Code is Invalid!"));

    //hash password and save code
    user.password = bcryptjs.hashSync(password, parseInt(process.env.SALT_ROUND));
    await user.save();

    //find all user token
    const tokens = await Token.find({ user: user._id });

    //Invalidate all tokens
    tokens.forEach(async (token) => {
        token.isValid = false
        await token.save();
    });

    //send response
    return res.json({ success: true, message: "Try to login again please.." });
});