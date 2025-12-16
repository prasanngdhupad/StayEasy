import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  /* ================= TENANT DETAILS ================= */
  tenantInfo: {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String, // ❗ phone should be string
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    address: String,
    city: String,
    state: String,
    pinCode: String,
  },

  /* ================= BOOKED PROPERTY ================= */
  bookingItems: [
    {
      property: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },

      propertyTitle: {
        type: String,
        required: true,
      },

      roomType: {
        type: String,
        required: true, // Single / Twin / Triple
      },

      monthlyRent: {
        type: Number,
        required: true,
      },

      image: {
        type: String,
        required: true,
      },

      stayDurationMonths: {
        type: Number,
        default: 1,
        min: 1,
      },
    },
  ],

  /* ================= BOOKING STATUS ================= */
  bookingStatus: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
    default: "Pending",
  },

  /* ================= USER ================= */
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },

  /* ================= PAYMENT ================= */
  paymentInfo: {
    transactionId: String,
    status: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    paymentMethod: String, // Razorpay / UPI / Cash
  },

  paidAt: Date,

  /* ================= PRICING ================= */
  rentAmount: {
    type: Number,
    required: true,
  },

  securityDeposit: {
    type: Number,
    default: 0,
  },

  maintenanceCharges: {
    type: Number,
    default: 0,
  },

  totalAmount: {
    type: Number,
    required: true,
  },

  /* ================= DATES ================= */
  checkInDate: {
    type: Date,
    required: true,
  },

  checkOutDate: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", orderSchema);
