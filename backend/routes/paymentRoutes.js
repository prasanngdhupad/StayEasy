import express from "express";
import { verifyUserAuth } from "../middleware/userAuth.js";
import {
  paymentVerification,
  processPayment,
  sendAPIKey,
} from "../controller/paymentController.js";

const router = express.Router();

/* =====================================================
   CREATE PAYMENT (ADVANCE / RENT)
===================================================== */
router.route("/payment/process").post(
  verifyUserAuth,
  processPayment
);

/* =====================================================
   SEND RAZORPAY PUBLIC KEY
===================================================== */
router.route("/getKey").get(
  verifyUserAuth,
  sendAPIKey
);

/* =====================================================
   VERIFY PAYMENT SIGNATURE
===================================================== */
router.route("/paymentVerification").post(
  paymentVerification
);

export default router;
