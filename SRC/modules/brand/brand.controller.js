import slugify from "slugify";
import { Category } from "../../../DB/models/category.model.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";
import { asyncHandler } from "../../utilis/asyncHandler.js";
import cloudinary from "../../utilis/cloud.js";
import { Brand } from "../../../DB/models/brand.model.js";


export const createBrand = asyncHandler(async (req, res, next) => {

    //check categories
    const { categories, name } = req.body;
    categories.forEach(async (categoryId) => {
        const category = await Category.findById(categoryId);
        if (!category) return next(new Error(`Category ${categoryId} doesn't exist!`, { cause: 404 }));
    });

    //check file

    if (!req.file) {
        return next(new Error("Brand pictute is required!", { cause: 400 }))
    }

    //upload file on cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        { folder: `${process.env.CLOUD_FOLDER_NAME}/brands` }
    );

    //save brand in DB

    const brand = await Brand.create({
        name,
        createdBy: req.user._id,
        slug: slugify(name),
        image: { url: secure_url, id: public_id },
    })

    //save brand in each category

    categories.forEach(async (categoryId) => {
        // const category =
        await Category.findByIdAndUpdate(categoryId, { $push: { brands: brand._id } });
        // category.brands.push(brand._id);
        // await category.save(); "two ways to push brand"
    });

    //return response
    return res.json({ success: true, message: "Brand created successfully!" })
});


export const updateBrand = asyncHandler(async (req, res, next) => {
    const brand = await Brand.findById(req.params.id);

    if (!brand) return next(new Error("Brand doesn't exist!", { cause: 404 }));

    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(brand.image.id);

        brand.image = { url: secure_url, id: public_id };
    };

    brand.name = req.body.name ? req.body.name : brand.name;
    brand.slug = req.body.name ? slugify(req.body.name) : brand.slug;

    await brand.save();

    return res.json({ success: true, message: "Brand updated successfully :)" });

});

export const deleteBrand = asyncHandler(async (req, res, next) => {
    const brand = await Brand.findByIdAndDelete(req.params.id);

    if (!brand) return next(new Error("Brand doesn't exist!", { cause: 404 }));

    // delete image 

    await cloudinary.uploader.destroy(brand.image.id);

    // find categories which have brand in brands array 

    await Category.updateMany({}, { $pull: { brands: brand._id } });

    return res.json({ success: true, message: "Brand deleted successfully!" });

});

export const getBrand = asyncHandler(async (req, res, next) => {
    const results = await Brand.find();
    return res.json({ success: true, results })
})