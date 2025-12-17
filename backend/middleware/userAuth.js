import HandleError from "../utils/handlerError.js";
import handleAsyncError from "./handleAsyncError.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
/* =====================================================
   AUTHENTICATE USER
===================================================== */
export const verifyUserAuth = handleAsyncError(async (req, res, next) => {
  console.log("COOKIES RECEIVED:", req.cookies);
  let { token } = req.cookies;

  // ✅ CHECK HEADER IF COOKIE MISSING
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.replace("Bearer ", "");
  }

  if (!token) {
    return next(
      new HandleError(
        "Authentication required. Please login to continue.",
        401
      )
    );
  }

  const decodedData = jwt.verify(
    token,
    process.env.JWT_SECRET_KEY
  );

  const userId = decodedData.id;

  // 🚨 CRITICAL FIX: Check if the ID is a valid Mongoose ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    // If the ID is invalid, consider the user not logged in (or token invalid)
    return next(
      new HandleError("Invalid user ID in token. Please login again.", 401)
    );
  }

  req.user = await User.findById(userId);

  if (!req.user) {
    // User ID was valid, but user was deleted from the DB
    return next(
      new HandleError("User not found. Please login again.", 401)
    );
  }

  next();
});

/* =====================================================
   ROLE BASED ACCESS CONTROL
===================================================== */
export const roleBasedAccess = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new HandleError(
          `Role '${req.user.role}' is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
