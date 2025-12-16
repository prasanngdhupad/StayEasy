import express from "express";
import {
  roleBasedAccess,
  verifyUserAuth,
} from "../middleware/userAuth.js";

import {
  allMyOrders,
  createNewOrder,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controller/OrderController.js";

const router = express.Router();

/* =====================================================
   TENANT ROUTES
===================================================== */

// Get logged-in user's bookings
router.route("/orders/user").get(
  verifyUserAuth,
  // 🎯 FIX 2: Ensure the 'user' role is explicitly allowed to view their own orders
  roleBasedAccess("user", "tenant", "admin"), 
  allMyOrders
);

// Create new booking
router.route("/order/new").post(
  verifyUserAuth,
  roleBasedAccess("tenant", "admin", "user"), 
  createNewOrder
);

// Get single booking
router.route("/order/:id").get(
  verifyUserAuth,
  getSingleOrder
);

/* =====================================================
   ADMIN ROUTES
===================================================== */

// Update booking status
router.route("/admin/order/:id").put(
  verifyUserAuth,
  roleBasedAccess("admin"),
  updateOrderStatus
);

// Delete completed booking
router.route("/admin/order/:id").delete(
  verifyUserAuth,
  roleBasedAccess("admin"),
  deleteOrder
);

// Get all bookings
router.route("/admin/orders").get(
  verifyUserAuth,
  roleBasedAccess("admin"),
  getAllOrders
);

export default router;