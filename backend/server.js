/* =====================================================
   UNCAUGHT EXCEPTION (MUST BE FIRST)
===================================================== */
process.on("uncaughtException", (err) => {
  console.error(`Error: ${err.message}`);
  console.error("Server shutting down due to uncaught exception");
  process.exit(1);
});

import dotenv from "dotenv";
import app from "./app.js";
import { connectMongoDatabase } from "./config/db.js";
import { v2 as cloudinary } from "cloudinary";
import Razorpay from "razorpay";

/* =====================================================
   CONFIG
===================================================== */
dotenv.config({ path: "./backend/config/config.env" });
console.log("ENV FILE PATH CHECK");
console.log("MONGO_URI =", process.env.MONGO_URI);


/* =====================================================
   ENV VALIDATION (FAIL FAST)
===================================================== */
const requiredEnv = [
  "MONGO_URI",
  "CLOUDINARY_NAME",
  "API_KEY",
  "API_SECRET",
  "RAZORPAY_API_KEY",
  "RAZORPAY_API_SECRET",
  "JWT_SECRET_KEY",
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
});

/* =====================================================
   DATABASE
===================================================== */
connectMongoDatabase();

/* =====================================================
   CLOUDINARY
===================================================== */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

/* =====================================================
   RAZORPAY INSTANCE
===================================================== */
export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

/* =====================================================
   SERVER
===================================================== */
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, "0.0.0.0",() => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/* =====================================================
   UNHANDLED PROMISE REJECTION
===================================================== */
process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  console.error("Server shutting down due to unhandled promise rejection");

  server.close(() => {
    process.exit(1);
  });
});
