import slugify from "slugify";
import { Category } from "../../../DB/models/category.model.js";
import { asyncHandler } from "../../utilis/asyncHandler.js";
import cloudinary from "../../utilis/cloud.js";

export const createCategory = asyncHandler(async (req, res, next) => {

    //check file
    if (!req.file) return next(new Error("Category image is required!!", { cause: 400 }));

    //Upload Image in Cloudinary
    const { public_id, secure_url } = await cloudinary.uploader.upload(
        req.file.path,
        {
            folder: `${process.env.CLOUD_FOLDER_NAME}/category`

        }
    )

    //Save category in DB
    await Category.create({
        name: req.body.name,
        slug: slugify(req.body.name),
        createdBy: req.user._id,
        image: { id: public_id, url: secure_url }
    });

    //return response
    return res.json({ success: true, message: "Category created successfully.." })
});

export const updateCategory = asyncHandler(async (req, res, next) => {

    //check category in DB
    const category = await Category.findById(req.params.id);
    if (!category) return next(new Error("Category not found", { cause: 404 }));

    //check category owner
    if (req.user._id.toString() !== category.createdBy.toString())
        return next(new Error("You aren't allowed to make any update!!"));

    //check file >>> upload on cloudinary
    if (req.file) {
        const { public_id, secure_url } = await cloudinary.uploader.upload(
            req.file.path,
            { public_id: category.image.id }
        );
        category.image = { id: public_id, url: secure_url };
    };
    //update category
    category.name = req.body.name ? req.body.name : category.name;
    category.slug = req.body.name ? slugify(req.body.name) : category.slug;

    // save category
    await category.save();

    //return response
    return res.json({ success: true, message: "Category updated successfully!!" })

});


export const deleteCategory = asyncHandler(async (req, res, next) => {

    //check category in DB
    const category = await Category.findById(req.params.id);
    if (!category) return next(new Error("Category not found!!", { cause: 404 }))

    //check owner
    if (category.createdBy.toString() !== req.user._id.toString())
        return next(new Error("You aren't allowed to delete!!"));

    //delete category from DB
    await category.deleteOne();

    //delete image category from cloudinary
    await cloudinary.uploader.destroy(category.image.id);

    //return response
    return res.json({ success: true, message: "Category deleted successfully!!" })

});

export const allCategories = asyncHandler(async (req, res, next) => {

    const results = await Category.find().populate("subcategory");

    return res.json({ success: true, results })
})