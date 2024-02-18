import { Coupon } from "../../../DB/models/coupon.model.js";
import { asyncHandler } from "../../utilis/asyncHandler.js";
import voucher_code from "voucher-code-generator"
export const createCoupon = asyncHandler(async (req, res, next) => {
    //generate code
    const code = voucher_code.generate({ length: 5 });

    //create coupon
    const coupon = await Coupon.create({
        name: code[0],
        createdBy: req.user._id,
        discount: req.body.discount,
        expiredAt: new Date(req.body.expiredAt).getTime(),
    })

    //response
    return res.status(201).json({ success: true, results: { coupon } });

});

export const updateCoupon = asyncHandler(async (req, res, next) => {
    //check coupon
    const coupon = await Coupon.findOne({
        name: req.params.code,
        expiredAt: { $gt: Date.now() },
    })

    if (!coupon) return next(new Error("Invalid Coupon!", { cause: 404 }))

    //check owner
    if (req.user._id.toString() !== coupon.createdBy.toString())
        return next(new Error("Not Authorizerd", { cause: 403 }))

    //Update coupon
    coupon.discount = req.body.discount ? req.body.discount : coupon.discount;

    coupon.expiredAt = req.body.expiredAt ? new Date(req.body.expiredAt).getTime() : coupon.expiredAt;

    await coupon.save();

    //response
    return res.json({ success: true, message: "Coupon Updated!!" })


});


export const deleteCoupon = asyncHandler(async (req, res, next) => {
    //check coupon

    const coupon = await Coupon.findOne({
        name: req.params.code,
    })

    if (!coupon) return next(new Error("Invalid Coupon!", { cause: 404 }))

    //check owner 

    if (req.user._id.toString() !== coupon.createdBy.toString())
        return next(new Error("Not Authorizerd", { cause: 403 }))

    //delete coupon

    await coupon.deleteOne();

    //response

    return res.json({ success: true, message: "Coupon Deleted!!" })
});

export const allCoupons = asyncHandler(async (req, res, next) => {

    //admin >> get all coupons
    if (req.user.role === " admin") {
        const coupons = await Coupon.find()
        return res.json({ success: true, results: { coupons } })
    }
    //seller >> get his coupons only

    if (req.user.role === "seller") {
        const coupons = await Coupon.find({ createdBy: req.user._id })
        return res.json({ success: true, results: { coupons } })
    }
});