import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import errorHandleMiddleware from "./middleware/error.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

/* =====================================================
   CONFIG (MUST BE FIRST)
===================================================== */
dotenv.config({ path: "backend/config/config.env" });

const app = express();

/* =====================================================
   MIDDLEWARE
===================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

/* =====================================================
   ROUTES
===================================================== */
app.use("/api", productRoutes);
app.use("/api", userRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);

/* =====================================================
   ERROR HANDLER (ALWAYS LAST)
===================================================== */
app.use(errorHandleMiddleware);

export default app;
