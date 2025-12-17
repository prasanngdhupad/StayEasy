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

// Trust proxy for Render deployment
app.set("trust proxy", 1);

app.use(
  cors({
    origin: "https://stay-easy-puce.vercel.app",
    credentials: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
