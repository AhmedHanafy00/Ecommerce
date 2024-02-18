import { Types, model } from "mongoose";
import { Schema } from "mongoose";
import { Subcategory } from "./subcategory.model.js";

const categorySchema = new Schema({
    name: { type: String, required: true, unique: true, min: 5, max: 20 },
    slug: { type: String, required: true, unique: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    image: { id: { type: String }, url: { type: String } },
    brands: [{ type: Types.ObjectId, ref: "Brand" }],

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });


//Delete Subcategories of certain Category once this Category is deleted
categorySchema.post("/deleteOne", { document: true, query: false }, async function () {

    //delete subcategory
    await Subcategory.deleteMany({
        category: this._id //this works on the document being worked on (deleteOne) which is category
    });
});




//virtual field "subcategory"
categorySchema.virtual("subcategory", {
    ref: "Subcategory",
    localField: "_id",   //Category
    foreignField: "category",    //Subcategory
});

export const Category = model("Category", categorySchema);