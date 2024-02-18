import express from "express";
import dotenv from "dotenv";
import { coonectionDB } from "./DB/connection.js";
import authRouter from "./SRC/modules/auth/auth.router.js"
import categoryRouter from "./SRC/modules/category/category.router.js"
import subcategoryRouter from "./SRC/modules/subcategory/subcategory.router.js"
import brandRouter from "./SRC/modules/brand/brand.router.js"
import couponRouter from "./SRC/modules/coupon/coupon.router.js"
import productRouter from "./SRC/modules/product/product.router.js"
import cartRouter from "./SRC/modules/cart/cart.router.js"
import orderRouter from "./SRC/modules/order/order.router.js"
import reviewRouter from "./SRC/modules/review/review.router.js"
import morgan from "morgan";
import cors from "cors";
dotenv.config();
const app = express();

const port = process.env.PORT;

//connect to DB
await coonectionDB();

//CORS
// const whitelist = ["http://127.0.0.1:5500"];
// app.use((req, res, next) => {
//     console.log(req.header("origin"));


//     if (req.originalUrl.includes("/auth/activate_account")) {
//         res.setHeader("Access-Control-Allow-Origin", "*");
//         res.setHeader("Access-Control-Allow-Methods", "GET");
//         return next();
//     }

//     if (!whitelist.includes(req.header("origin"))) {
//         return next(new Error("Blocked By CORS!!"))
//     }
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "*");
//     res.setHeader("Access-Control-Allow-Methods", "*");
//     res.setHeader("Access-Control-Private-Network", true);
//     //backend >> deployment ,, frontend >>> locl "Private" network

//     return next();
// });

app.use(cors()); //allow access from everywhere

//morgan

app.use(morgan("combined"))

//parsing
app.use(express.json())

//routers
app.use("/auth", authRouter);

app.use("/category", categoryRouter);

app.use("/subcategory", subcategoryRouter);

app.use("/brand", brandRouter);

app.use("/coupon", couponRouter);

app.use("/product", productRouter);

app.use("/cart", cartRouter);

app.use("/order", orderRouter);

app.use("/review", reviewRouter);

//"page not found" handler
app.all("*", (req, res, next) => {
    return next(new Error("page not found ", { cause: 404 }));
});

//global error handler
app.use((error, req, res, next) => {
    const statusCode = error.cause || 500
    return res.status(statusCode).json({
        success: false,
        message: error.message,
        stack: error.stack,
    })
});


app.listen(port, () => console.log("App is up and running at port: ", port));