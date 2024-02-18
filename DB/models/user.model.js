import { Schema, model } from "mongoose";
import bcryptjs from "bcryptjs"
const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        min: 3,
        max: 20,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    isConfirmed: { type: Boolean, default: false },
    gender: {
        type: String,
        enum: ["male", "female"],
    },
    phone: {
        type: String,
    },
    role: {
        type: String,
        enum: ["user", "seller", "admin"],
        default: "user",
    },
    forgetCode: String,
    profileImage: {
        url: {
            type: String,
            default:
                "https://res.cloudinary.com/dz9ybmw2a/image/upload/v1706916616/Ecommerce/users/defaults/profilePic/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69_undxlm.jpg"
        },
        id: {
            type: String,
            default: "Ecommerce/users/defaults/profilePic/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69_undxlm"
        }
    },
    coverImages: [{ url: { type: String }, id: { type: String } }]

}, { timestamps: true });

//to hash the password anytime needed
userSchema.pre("save", function () {

    if (this.isModified("password")) {
        this.password = bcryptjs.hashSync(
            this.password, parseInt(process.env.SALT_ROUND)
        );
    }
});


export const User = model("User", userSchema);