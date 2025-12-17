import handleAsyncError from "../middleware/handleAsyncError.js";
import User from "../models/userModel.js";
import HandleError from "../utils/handlerError.js";
import { sendToken } from "../utils/jwtTokens.js";
import { sendEmail } from "../utils/sendEmail.js";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import mongoose from "mongoose";

/* REGISTER */
export const registerUser = handleAsyncError(async (req, res) => {
  const { name, email, password, avatar, role, phoneNumber } = req.body;

  let avatarData = {};
  if (avatar) {
    const upload = await cloudinary.uploader.upload(avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
    avatarData = {
      public_id: upload.public_id,
      url: upload.secure_url,
    };
  }

  const user = await User.create({
    name,
    email,
    password,
    phoneNumber,
    role: role === "owner" ? "owner" : "tenant",
    avatar: avatarData,
  });

  sendToken(user, 201, res);
});

/* LOGIN */
export const loginUser = handleAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new HandleError("Email or password required", 400));

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.verifyPassword(password)))
    return next(new HandleError("Invalid email or password", 401));

  sendToken(user, 200, res);
});

/* LOGOUT */
export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none", // ✅ lowercase (MUST MATCH sendToken)
    path: "/",        // ✅ important
    expires: new Date(0),
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};
;


/* PASSWORD RESET REQUEST */
export const reqPasswordReset = handleAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new HandleError("User not found", 404));

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get("host")}/reset/${resetToken}`;
  await sendEmail({
    email: user.email,
    subject: "Password Reset",
    message: `Reset password link:\n${resetURL}`,
  });

  res.json({ success: true, message: "Reset email sent" });
});

/* RESET PASSWORD */
export const resetPassword = handleAsyncError(async (req, res, next) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return next(new HandleError("Invalid or expired token", 400));

  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword)
    return next(new HandleError("Passwords do not match", 400));

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendToken(user, 200, res);
});

/* =====================================================
   DELETE USER (ADMIN)
===================================================== */
export const deleteUser = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new HandleError("User not found", 404));
  }

  // remove avatar from cloudinary if exists
  if (user.avatar?.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});


/* UPDATE PROFILE */
export const updateProfile = handleAsyncError(async (req, res, next) => {
  const { name, email, avatar, phoneNumber } = req.body;

  const emailExists = await User.findOne({ email });
  if (emailExists && emailExists._id.toString() !== req.user.id) {
    return next(new HandleError("Email already in use", 400));
  }

  const updates = { name, email, phoneNumber };

  if (avatar) {
    const user = await User.findById(req.user.id);
    if (user.avatar?.public_id)
      await cloudinary.uploader.destroy(user.avatar.public_id);

    const upload = await cloudinary.uploader.upload(avatar, {
      folder: "avatars",
    });

    updates.avatar = {
      public_id: upload.public_id,
      url: upload.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, user });
});

/* =====================================================
   GET ALL USERS (ADMIN)
===================================================== */
export const getUserList = handleAsyncError(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

/* =====================================================
   GET SINGLE USER (ADMIN)
===================================================== */
export const getSingleUser = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new HandleError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/* =====================================================
   UPDATE USER ROLE (ADMIN)
===================================================== */
export const updateUserRole = handleAsyncError(async (req, res, next) => {
  const { role } = req.body;

  if (!["admin", "owner", "tenant"].includes(role)) {
    return next(new HandleError("Invalid role", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new HandleError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/* =====================================================
   GET LOGGED-IN USER DETAILS
===================================================== */
export const getUserDetails = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new HandleError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/* =====================================================
   UPDATE PASSWORD (LOGGED-IN USER)
===================================================== */
export const updatePassword = handleAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(new HandleError("User not found", 404));
  }

  // check old password
  const isMatched = await user.verifyPassword(oldPassword);
  if (!isMatched) {
    return next(new HandleError("Old password is incorrect", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new HandleError("Passwords do not match", 400));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});
