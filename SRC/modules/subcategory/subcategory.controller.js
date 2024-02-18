import slugify from "slugify";
import { Category } from "../../../DB/models/category.model.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";
import { asyncHandler } from "../../utilis/asyncHandler.js";
import cloudinary from "../../utilis/cloud.js";

export const createSubcategory = asyncHandler(async (req, res, next) => {
    //check category
    const category = await Category.findById(req.params.category);
    if (!category) return next(new Error("Category not found", { cause: 404 }))
    //check file
    if (!req.file) return next(new Error("Subcategory image is required!!", { cause: 400 }));

    //Upload Image in Cloudinary
    const { public_id, secure_url } = await cloudinary.uploader.upload(
        req.file.path,
        {
            folder: `${process.env.CLOUD_FOLDER_NAME}/subcategory`

        }
    )

    //Save subcategory in DB
    await Subcategory.create({
        name: req.body.name,
        slug: slugify(req.body.name),
        createdBy: req.user._id,
        image: { id: public_id, url: secure_url },
        category: req.params.category,
    });

    //return response
    return res.json({ success: true, message: "Subcategory created successfully.." })
});

export const updateSubcategory = asyncHandler(async (req, res, next) => {

    //check category in DB
    const category = await Category.findById(req.params.category);
    if (!category) return next(new Error("Category not found", { cause: 404 }));

    //check Subcategory in DB & if the category is the right parent of the subcategory
    const subcategory = await Subcategory.findOne({
        _id: req.params.id,
        category: req.params.category
    });
    if (!subcategory) return next(new Error("Subcategory not found", { cause: 404 }));

    //check subcategory owner
    if (req.user._id.toString() !== subcategory.createdBy.toString())
        return next(new Error("You aren't allowed to make any update on subcategory!!"));

    //check file >>> upload on cloudinary
    if (req.file) {
        const { public_id, secure_url } = await cloudinary.uploader.upload(
            req.file.path,
            { public_id: subcategory.image.id }
        );
        subcategory.image = { id: public_id, url: secure_url };
    };
    //update subcategory
    subcategory.name = req.body.name ? req.body.name : subcategory.name;
    subcategory.slug = req.body.name ? slugify(req.body.name) : subcategory.slug;

    // save subcategory
    await subcategory.save();

    //return response
    return res.json({
        success: true,
        message: "Subcategory updated successfully!!"
    })

});

export const deleteSubcategory = asyncHandler(async (req, res, next) => {

    //check category in DB
    const category = await Category.findById(req.params.category);
    if (!category) return next(new Error("Category not found", { cause: 404 }));

    //check Subcategory in DB & if the category is the right parent of the subcategory
    const subcategory = await Subcategory.findOne({
        _id: req.params.id,
        category: req.params.category
    });
    if (!subcategory) return next(new Error("Subcategory not found", { cause: 404 }));

    //check subcategory owner
    if (req.user._id.toString() !== subcategory.createdBy.toString())
        return next(new Error("You aren't allowed to make any update on subcategory!!"));

    //delete subcategory from DB
    await subcategory.deleteOne();

    //delete image category from cloudinary
    await cloudinary.uploader.destroy(subcategory.image.id);

    //return response
    return res.json({
        success: true,
        message: "subcategory deleted successfully!!"
    });

});


export const getSubcategories = asyncHandler(async (req, res, next) => {


    if (req.params.category !== undefined) {
        //check category in DB
        const category = await Category.findById(req.params.category);
        if (!category) return next(new Error("Category not found", { cause: 404 }));
        //all subcategories of specific category
        const results = await Subcategory.find({ category: req.params.category });
        return res.json({ success: true, results });
    }
    // const result = await Subcategory.find().populate([{
    //     path: "category", select: "name -_id"
    // }, {
    //     path: "createdBy",
    // }]); //multiple populate

    // const result = await Subcategory.find().populate([{
    //     path: "category", populate: [{ path: "createdBy", select: "email" }]
    // }]); // nested populate 

    const result = await Subcategory.find().populate([{
        path: "category", populate: [{ path: "createdBy", select: "email" }]
    },{
        path: "createdBy"
    }
    ]); //multiple populate with nested populate

    return res.json({ success: true, result });


})