import handleAsyncError from "../middleware/handleAsyncError.js";
import { instance } from "../server.js"; // Assumed import for Razorpay instance
import crypto from "crypto";
import HandleError from "../utils/handlerError.js";
// 🚨 ASSUMED: Import your Mongoose Order Model
import Order from "../models/orderModel.js"; 
/* =====================================================
   1️⃣ CREATE BOOKING PAYMENT (Advance / Token Amount)
===================================================== */
export const processPayment = handleAsyncError(async (req, res, next) => {
  const { amount } = req.body; 
  const parsedAmount = Number(amount);

  // Input validation to prevent payment gateway issues
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return next(new HandleError("Invalid or zero amount provided for payment.", 400));
  }

  const options = {
    amount: parsedAmount * 100, // INR → paise
    currency: "INR",
    receipt: `booking_${Date.now()}`,
  };

  try {
    // Attempt to create the order via Razorpay API
    const order = await instance.orders.create(options);
    
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay Order Creation Failed:", error);
    // Provide a detailed error if possible, otherwise a generic server error
    const errorMessage = error.error?.description || "Payment gateway processing failed due to server error. Please check API keys.";
    return next(new HandleError(errorMessage, 500));
  }
});

/* =====================================================
   2️⃣ SEND RAZORPAY API KEY
===================================================== */
export const sendAPIKey = handleAsyncError(async (req, res) => {
  res.status(200).json({
    success: true,
    // Send only the public API key (Key ID)
    key: process.env.RAZORPAY_API_KEY, 
  });
});

/* =====================================================
   3️⃣ VERIFY PAYMENT (For webhooks/callbacks)
===================================================== */



/* =====================================================
   3️⃣ VERIFY PAYMENT (For webhooks/callbacks)
===================================================== */
export const paymentVerification = handleAsyncError(async (req, res, next) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    bookingId,
  } = req.body;

  if (
    !razorpay_payment_id ||
    !razorpay_order_id ||
    !razorpay_signature ||
    !bookingId
  ) {
    return next(new HandleError("Missing payment details", 400));
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return next(new HandleError("Payment verification failed", 400));
  }

  const booking = await Order.findById(bookingId);

  if (!booking) {
    return next(new HandleError("Booking not found", 404));
  }

  // 🔒 Prevent duplicate verification
  if (booking.paymentInfo?.status === "Paid") {
    return res.status(200).json({
      success: true,
      message: "Payment already verified",
    });
  }

  booking.paymentInfo = {
    transactionId: razorpay_payment_id,
    status: "Paid",
    paymentMethod: "Razorpay",
  };

  booking.paidAt = Date.now();
  booking.bookingStatus = "Confirmed"; // ✅ THIS FIXES UI

  await booking.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Payment verified and booking confirmed",
  });
});
