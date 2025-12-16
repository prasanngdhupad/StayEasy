import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 25,
      minLength: 3,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: true,
      minLength: 8,
      select: false,
    },

    avatar: {
      public_id: String,
      url: String,
    },

    role: {
      type: String,
      enum: ["tenant", "owner", "admin"],
      default: "tenant",
    },

    phoneNumber: String,

    propertiesListed: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

/* Hash password */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

/* JWT */
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

/* Compare password */
userSchema.methods.verifyPassword = async function (enteredPassword) {
  return bcryptjs.compare(enteredPassword, this.password);
};

/* Reset token */
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

export default mongoose.model("User", userSchema);
