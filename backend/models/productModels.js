import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  /* ================= BASIC INFO ================= */
  title: {
    type: String,
    required: [true, "Please enter PG / Hostel name"],
    trim: true,
  },

  propertyType: {
    type: String,
    enum: ["PG", "Hostel", "Room", "Flat"],
    required: true,
  },

  forWhom: {
    type: String,
    enum: ["Boys", "Girls", "Both"],
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  /* ================= PRICING ================= */
  startingRent: {
    type: Number,
    required: true,
  },

  roomTypes: {
    single: Number,
    twin: Number,
    triple: Number,
    fourSharing: Number,
  },

  /* ================= LOCATION ================= */
  locality: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },

  fullAddress: {
    type: String,
    required: true,
  },

  latitude: Number,
  longitude: Number,

  nearbyPlaces: [
    {
      placeName: String,
      distanceKm: Number,
    },
  ],

  /* ================= MEDIA ================= */
  images: [
    {
      publicId: String,
      url: String,
    },
  ],

  /* ================= AVAILABILITY ================= */
  totalRooms: {
    type: Number,
    default: 1,
  },

  availableBeds: {
    type: Number,
    default: 1,
  },

  /* ================= AMENITIES ================= */
  amenities: {
    type: [String],
    default: [],
  },

  /* ================= OWNER ================= */
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },

  phoneNumber: {
    type: String,
    required: true,
  },

  /* ================= RATINGS & REVIEWS ================= */
  averageRating: {
    type: Number,
    default: 0,
  },

  reviewCount: {
    type: Number,
    default: 0,
  },

  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: String,
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
    },
  ],

  /* ================= META ================= */
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* Text search support */
productSchema.index({ title: "text", city: "text", locality: "text" });

export default mongoose.model("Product", productSchema);
