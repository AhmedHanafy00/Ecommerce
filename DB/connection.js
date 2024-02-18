import mongoose from "mongoose";

export const coonectionDB = async () => {
    return await mongoose
        .connect(process.env.CONNECTION_URL)
        .then(() => console.log("DB connected :) "))
        .catch(()=>console.log("failed to connect unfortunately"));


}