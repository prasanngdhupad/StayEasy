import HandleError from "../utils/handlerError.js";
import handleAsyncError from "./handleAsyncError.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

/* =====================================================
   AUTHENTICATE USER (COOKIE ONLY)
===================================================== */
export const verifyUserAuth = handleAsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  // ❌ NO HEADER FALLBACK — COOKIE ONLY
  if (!token) {
    return next(
      new HandleError(
        "Authentication required. Please login to continue.",
        401
      )
    );
  }

  // verify JWT
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const userId = decoded.id;

  // validate Mongo ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(
      new HandleError("Invalid token. Please login again.", 401)
    );
  }

  // find user
  const user = await User.findById(userId);

  if (!user) {
    return next(
      new HandleError("User not found. Please login again.", 401)
    );
  }

  req.user = user;
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
