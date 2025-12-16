import express from "express";
import {
  createProducts,
  createReviewForProducts,
  deleteProduct,
  deleteReview,
  getAdminProducts,
  getProductReviews,
  getProducts,
  getSingleProduct,
  updateProducts,
} from "../controller/productController.js";

import {
  verifyUserAuth,
  roleBasedAccess,
} from "../middleware/userAuth.js";

const router = express.Router();

/* =====================================================
   PUBLIC ROUTES
===================================================== */

// Get all PG / Hostel / Rooms
router.route("/products").get(getProducts);

// Get single property details
router.route("/product/:id").get(getSingleProduct);

// Get reviews of a property
router.route("/product/reviews").get(getProductReviews);

/* =====================================================
   USER ROUTES (TENANT)
===================================================== */

// Add or update review
router.route("/review").put(
  verifyUserAuth,
  // ✅ CORRECTION: Add 'user' role to allow standard authenticated users to leave reviews
  roleBasedAccess("tenant", "admin", "user"), 
  createReviewForProducts
);

// Delete review (owner of review or admin)
router.route("/review").delete(
  verifyUserAuth,
  deleteReview
);

/* =====================================================
   ADMIN ROUTES
===================================================== */

// Get all properties (Admin only)
router.route("/admin/products").get(
  verifyUserAuth,
  roleBasedAccess("admin"),
  getAdminProducts
);

/* =====================================================
   OWNER & ADMIN ROUTES
===================================================== */

// Create new property
router.route("/admin/product").post(
  verifyUserAuth,
  roleBasedAccess("owner", "admin"),
  createProducts
);

// Update or delete property
router.route("/admin/product/:id")
  .put(
    verifyUserAuth,
    roleBasedAccess("owner", "admin"),
    updateProducts
  )
  .delete(
    verifyUserAuth,
    roleBasedAccess("owner", "admin"),
    deleteProduct
  );

export default router;