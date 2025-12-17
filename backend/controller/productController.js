import Product from "../models/productModels.js";
import HandleError from "../utils/handlerError.js";
import handleAsyncError from "../middleware/handleAsyncError.js";
import mongoose from "mongoose";
import APIFunctionality from "../utils/apiFunctionality.js";
import { v2 as cloudinary } from "cloudinary";

const safeNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  return Number(value);
};

/* =====================================================
   CREATE PROPERTY
===================================================== */
export const createProducts = handleAsyncError(async (req, res) => {
  if (!req.user || !req.user.id) {
    throw new HandleError("User not logged in or token missing.", 401);
  }

  if (!req.body.title || !req.body.city || !req.body.locality) {
    throw new HandleError(
      "Required fields (Title, City, Locality) missing.",
      400
    );
  }

  /* ================= IMAGES ================= */
  let images = [];

  if (req.body.images) {
    if (typeof req.body.images === "string") {
      images = [req.body.images];
    } else if (Array.isArray(req.body.images)) {
      images = req.body.images;
    }
  }

  const imageLinks = [];

  for (const img of images) {
    const result = await cloudinary.uploader.upload(img, {
      folder: "properties",
    });

    imageLinks.push({
      publicId: result.public_id,
      url: result.secure_url,
    });
  }

  /* ================= CLEAN BODY AND ADD ROOM TYPES ================= */
  // 🎯 FIX 1: Destructure roomTypes from req.body
  const { roomTypes, ...restBody } = req.body; 

  const propertyData = {
    ...restBody,
    // Explicitly include the new roomTypes object
    roomTypes: roomTypes, 
    
    // Ensure all numbers are correctly cast (using safeNumber is correct)
    startingRent: safeNumber(req.body.startingRent),
    totalRooms: safeNumber(req.body.totalRooms),
    availableBeds: safeNumber(req.body.availableBeds),
    latitude: safeNumber(req.body.latitude),
    longitude: safeNumber(req.body.longitude),
    
    // Set image links and owner ID
    images: imageLinks,
    owner: req.user.id,
  };

  const property = await Product.create(propertyData);

  res.status(201).json({
    success: true,
    property,
  });
});

/* =====================================================
   GET ALL PROPERTIES (SEARCH + FILTER + PAGINATION)
===================================================== */
export const getProducts = handleAsyncError(async (req, res, next) => {
  const resultsPerPage = 4;

  const apiFeature = new APIFunctionality(Product.find(), req.query)
    .search()
    .filter()
    .sort();

  const filteredQuery = apiFeature.query.clone();
  const propertyCount = await filteredQuery.countDocuments();

  const page = Number(req.query.page) || 1;
  const totalPages = Math.ceil(propertyCount / resultsPerPage);

  if (page > totalPages && propertyCount > 0) {
    return next(new HandleError("Page not found", 404));
  }

  apiFeature.pagination(resultsPerPage);
  const properties = await apiFeature.query;

  res.status(200).json({
    success: true,
    properties,
    propertyCount,
    resultsPerPage,
    currentPage: page,
    totalPages,
  });
});

/* =====================================================
   GET SINGLE PROPERTY
===================================================== */
export const getSingleProduct = handleAsyncError(async (req, res, next) => {
  const property = await Product.findById(req.params.id).populate(
    "owner",
    "name email"
  );

  if (!property) {
    return next(new HandleError("Property not found", 404));
  }

  // 🎯 FIX 2: Correcting the static map URL format (using template literals)
  const mapUrl =
    property.latitude && property.longitude
      ? `https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`
      : null;

  res.status(200).json({
    success: true,
    property,
    mapUrl,
  });
});

/* =====================================================
   UPDATE PROPERTY
===================================================== */
export const updateProducts = handleAsyncError(async (req, res, next) => {
  let property = await Product.findById(req.params.id);

  if (!property) {
    return next(new HandleError("Property not found", 404));
  }

  if (
    property.owner.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(new HandleError("Not authorized", 403));
  }

  /* ================= IMAGE HANDLING (SAFE & FINAL) ================= */
  let uploadedImages = [];

  if (req.body.images !== undefined) {
    let images = [];

    if (typeof req.body.images === "string") {
      images = [req.body.images];
    } else if (Array.isArray(req.body.images)) {
      images = req.body.images;
    }

    // 🔥 Delete old images ONLY when new images are uploaded
    for (let img of property.images || []) {
      if (img?.publicId) {
        await cloudinary.uploader.destroy(img.publicId);
      }
    }

    // Upload new images
    for (let img of images) {
      const result = await cloudinary.uploader.upload(img, {
        folder: "properties",
      });

      uploadedImages.push({
        publicId: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = uploadedImages;
  } else {
    // ✅ Keep existing images
    req.body.images = property.images;
  }

  /* ================= NUMBER SAFETY ================= */
  const updateData = { ...req.body };

  if (updateData.startingRent !== undefined)
    updateData.startingRent = safeNumber(updateData.startingRent);

  if (updateData.availableBeds !== undefined)
    updateData.availableBeds = safeNumber(updateData.availableBeds);

  if (updateData.totalRooms !== undefined)
    updateData.totalRooms = safeNumber(updateData.totalRooms);

  if (updateData.latitude !== undefined)
    updateData.latitude = safeNumber(updateData.latitude);

  if (updateData.longitude !== undefined)
    updateData.longitude = safeNumber(updateData.longitude);

  property = await Product.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    property,
  });
});



/* =====================================================
   DELETE PROPERTY
===================================================== */
export const deleteProduct = handleAsyncError(async (req, res, next) => {
  const property = await Product.findById(req.params.id);

  if (!property) {
    return next(new HandleError("Property not found", 404));
  }

  if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new HandleError("Not authorized", 403));
  }

  for (let img of property.images || []) {
    if (img && img.publicId) { // Robust null/undefined check
      await cloudinary.uploader.destroy(img.publicId);
    }
  }

  await property.deleteOne();

  res.status(200).json({
    success: true,
    message: "Property deleted successfully",
  });
});

/* =====================================================
   CREATE / UPDATE REVIEW
===================================================== */
export const createReviewForProducts = handleAsyncError(
  async (req, res, next) => {
    const { rating, comment, propertyId } = req.body;

    const property = await Product.findById(propertyId);
    if (!property) {
      return next(new HandleError("Property not found", 404));
    }

    const reviewExists = property.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (reviewExists) {
      property.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString()) {
          rev.rating = rating;
          rev.comment = comment;
        }
      });
    } else {
      property.reviews.push({
        user: req.user._id,
        name: req.user.name,
        rating,
        comment,
      });
    }

    property.reviewCount = property.reviews.length;
    property.averageRating =
      property.reviews.reduce((acc, r) => acc + r.rating, 0) /
        property.reviews.length || 0;

    await property.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      property,
    });
  }
);

/* =====================================================
   GET REVIEWS
===================================================== */
export const getProductReviews = handleAsyncError(async (req, res, next) => {
  const propertyId = req.query.id;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return next(new HandleError("Invalid property ID", 400));
  }

  const property = await Product.findById(propertyId);

  if (!property) {
    return next(new HandleError("Property not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: property.reviews,
  });
});

/* =====================================================
   DELETE REVIEW
===================================================== */
export const deleteReview = handleAsyncError(async (req, res, next) => {
  const property = await Product.findById(req.query.propertyId);

  if (!property) {
    return next(new HandleError("Property not found", 404));
  }

  const reviews = property.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  property.reviews = reviews;
  property.reviewCount = reviews.length;
  property.averageRating =
    reviews.length === 0
      ? 0
      : reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  await property.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

/* =====================================================
   ADMIN: GET ALL PROPERTIES
===================================================== */
export const getAdminProducts = handleAsyncError(async (req, res) => {
  const properties = await Product.find();
  res.status(200).json({
    success: true,
    properties,
  });
});


