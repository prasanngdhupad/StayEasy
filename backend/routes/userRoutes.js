import express from "express";
import {
  deleteUser,
  getSingleUser,
  getUserDetails,
  getUserList,
  loginUser,
  logout,
  registerUser,
  reqPasswordReset,
  resetPassword,
  updatePassword,
  updateProfile,
  updateUserRole,
} from "../controller/userController.js";

import {
  roleBasedAccess,
  verifyUserAuth,
} from "../middleware/userAuth.js";

const router = express.Router();

/* =====================================================
   AUTH ROUTES
===================================================== */

router.route("/register").post(registerUser); // tenant / owner
router.route("/login").post(loginUser);
router.route("/logout").post(verifyUserAuth, logout);

/* =====================================================
   PASSWORD ROUTES
===================================================== */

router.route("/password/forgot").post(reqPasswordReset);
router.route("/password/reset/:token").post(resetPassword);

/* =====================================================
   USER PROFILE
===================================================== */

router.route("/profile").get(
  verifyUserAuth,
  getUserDetails
);

router.route("/password/update").put(
  verifyUserAuth,
  updatePassword
);

router.route("/profile/update").put(
  verifyUserAuth,
  updateProfile
);

/* =====================================================
   ADMIN ROUTES
===================================================== */

router.route("/admin/users").get(
  verifyUserAuth,
  roleBasedAccess("admin"),
  getUserList
);

router
  .route("/admin/user/:id")
  .get(
    verifyUserAuth,
    roleBasedAccess("admin"),
    getSingleUser
  )
  .put(
    verifyUserAuth,
    roleBasedAccess("admin"),
    updateUserRole
  )
  .delete(
    verifyUserAuth,
    roleBasedAccess("admin"),
    deleteUser
  );

export default router;
