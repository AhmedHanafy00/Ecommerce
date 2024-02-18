import { Cart } from "../../../DB/models/cart.model.js";
import { Coupon } from "../../../DB/models/coupon.model.js";
import { Order } from "../../../DB/models/order.model.js";
import { Product } from "../../../DB/models/product.model.js";
import { asyncHandler } from "../../utilis/asyncHandler.js";
import cloudinary from "../../utilis/cloud.js";
import createInvoice from "../../utilis/pdfinvoice.js";
import path from "path"
import { fileURLToPath } from "url";
import { sendEmail } from "../../utilis/sendEmails.js";
import { clearCart, updateStock } from "./order.service.js";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));


export const createOrder = asyncHandler(async (req, res, next) => {

    //data
    const { payment, address, coupon, phone } = req.body;

    //check coupon
    let checkCoupon;
    if (coupon) {
        checkCoupon = await Coupon.findOne({ name: coupon, expiredAt: { $gt: Date.now() } })
    }
    if (!checkCoupon) {
        return next(new Error("Invalid Coupon", { cause: 400 }));
    }

    //get products from cart
    const cart = await Cart.findOne({ user: req.user._id });
    const products = cart.products;

    if (products.lenght < 1) return next(new Error("Empty cart!"));

    //check products
    let orderProducts = [];
    let orderPrice = 0;

    for (let i = 0; i < products.length; i++) {
        const product = await Product.findById(products[i].productId)
        if (!product) return next(new Error(`${products[i].productId} Product not found`));

        if (!product.inStock(products[i].quantity))
            return next(new Error(`product out of stock, only ${product.availableItems} are available!`));


        orderProducts.push({
            name: product.name,
            quantity: products[i].quantity,
            itemPrice: product.finalPrice,
            totalPrice: product.finalPrice * products[i].quantity,
            productId: product._id,
        });
        orderPrice += product.finalPrice * products[i].quantity;
    }

    //create order in DB
    const order = await Order.create({
        user: req.user._id,
        address,
        phone,
        payment,
        products: orderProducts,
        price: orderPrice,
        coupon: {
            id: checkCoupon?._id,
            name: checkCoupon?.name,
            discount: checkCoupon?.discount,
        },
    });

    //create invoice
    const user = req.user;
    const invoice = {

        shipping: {
            name: user.userName,
            address: order.address,
            country: "Egypt",
        },
        items: order.products,
        subtotal: order.price, //price before discount
        paid: order.finalPrice, //after discount
        invoice_nr: order._id,
    };

    const pdfPath = path.join(__dirname, `./../../tempInvoices/${order._id}.pdf`);
    createInvoice(invoice, pdfPath);

    //upload on cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath, {
        folder: `${process.env.CLOUD_FOLDER_NAME}/order/invoices`
    });

    // add invoice in Db "file" --> url & id
    order.invoice = { url: secure_url, id: public_id };
    await order.save();

    //send email to user "invoice"
    const isSent = await sendEmail({
        to: user.email,
        subject: "Order Invoice",
        attachments: [{ path: secure_url, contentType: "application/pdf" }]
    });
    if (!isSent) return next(new Error("Error!!"))

    //update stock
    updateStock(order.products, true);

    //clear cart
    clearCart(user._id);

    //visa payment
    if (payment === "visa") {

        //stripe gateway
        const stripe = new Stripe(process.env.STRIPE_KEY);

        //coupon stripe
        let couponExisted;
        if (order.coupon.name !== undefined) {
            couponExisted = await stripe.coupons.create({
                percent_off: order.coupon.discount,
                duration: "once",
            })
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: process.env.SUCCESS_URL,
            cancel_url: process.env.CANCEL_URL,
            line_items: order.products.map((product) => {
                return {
                    price_data: {
                        currency: "EGP",
                        product_data: {
                            name: product.name,
                            // images: [product.productId.defaultImage.url]
                        },
                        unit_amount: product.itemPrice * 100,
                    },
                    quantity: product.quantity,
                };
            }),
            discounts: couponExisted ? [{ coupon: couponExisted.id }] : [],
        })
        return res.json({ success: true, results: { url: session.url } });
    }

    //response
    return res.json({ success: true, results: { order } });
});





export const cancelOrder = asyncHandler(async (req, res, next) => {

    //check order
    const order = await Order.findById(req.params.id);
    if (!order) return next(new Error("Invalid order ID!", { cause: 400 }))

    //check status
    if (order.status === "delivered" || order.status === "shipped" || order.status === "cancelled")
        return next(new Error("Order can't be cancelled!!"))

    //cancel order
    order.status = "cancelled";
    await order.save();

    //update stock
    updateStock(order.products, false)

    //response
    return res.json({ success: true, message: "Your order has been cancelled!" })
})