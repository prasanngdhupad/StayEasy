import HandleError from "../utils/handlerError.js";
import handleAsyncError from "./handleAsyncError.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const verifyUserAuth = handleAsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(
      new HandleError("Authentication required. Please login.", 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const userId = decoded.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new HandleError("Invalid token. Login again.", 401));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new HandleError("User not found. Login again.", 401));
  }

  req.user = user;
  next();
});
