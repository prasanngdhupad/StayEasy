import Order from "../models/orderModel.js";
import Product from "../models/productModels.js";
import HandleError from "../utils/handlerError.js";
import handleAsyncError from "../middleware/handleAsyncError.js";

/* =====================================================
   CREATE NEW BOOKING
===================================================== */
export const createNewOrder = handleAsyncError(async (req, res) => {
  const {
    tenantInfo,
    bookingItems,
    rentAmount,
    securityDeposit,
    maintenanceCharges,
    totalAmount,
    checkInDate,
  } = req.body;

  if (!bookingItems || bookingItems.length === 0) {
    throw new HandleError("No booking items found", 400);
  }

  const booking = await Order.create({
    tenantInfo,
    bookingItems,
    rentAmount,
    securityDeposit,
    maintenanceCharges,
    totalAmount,
    checkInDate,
    bookingStatus: "Pending",
    paymentInfo: { status: "Pending" },
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    booking,
  });
});


/* =====================================================
   GET SINGLE BOOKING
===================================================== */
export const getSingleOrder = handleAsyncError(async (req, res, next) => {
  const booking = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("bookingItems.property", "title city locality");

  if (!booking) {
    return next(new HandleError("Booking not found", 404));
  }

  // ❗ user can only see his own booking
  if (
    booking.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new HandleError("Not authorized", 403));
  }

  res.status(200).json({
    success: true,
    booking,
  });
});

/* =====================================================
   GET LOGGED-IN USER BOOKINGS
===================================================== */
export const allMyOrders = handleAsyncError(async (req, res) => {
  const bookings = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    bookings,
  });
});


/* =====================================================
   ADMIN: GET ALL BOOKINGS
===================================================== */
export const getAllOrders = handleAsyncError(async (req, res) => {
  const bookings = await Order.find();

  const totalRevenue = bookings.reduce(
    (acc, b) => acc + b.totalAmount,
    0
  );

  res.status(200).json({
    success: true,
    bookings,
    totalRevenue,
  });
});

/* =====================================================
   UPDATE BOOKING STATUS (ADMIN)
===================================================== */
export const updateOrderStatus = handleAsyncError(async (req, res, next) => {
  const booking = await Order.findById(req.params.id);

  if (!booking) {
    return next(new HandleError("Booking not found", 404));
  }

  // --- Start of Recommended Security/Validation Check ---
  if (req.body.status === "Confirmed" && booking.paymentInfo.status !== "Paid") {
    return next(
      new HandleError("Cannot confirm booking. Payment status is still " + booking.paymentInfo.status, 400)
    );
  }
  // --- End of Recommended Security/Validation Check ---

  if (booking.bookingStatus === "Completed") {
    return next(
      new HandleError("This booking is already completed", 400)
    );
  }

  if (req.body.status === "Confirmed") {
    // This logic to reduce available beds is correct and stays here.
    await Promise.all(
      booking.bookingItems.map((item) =>
        reduceAvailableBeds(item.property, 1)
      )
    );
  }

  booking.bookingStatus = req.body.status;

  if (req.body.status === "Completed") {
    booking.checkOutDate = Date.now();
  }

  await booking.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    booking,
  });
});

/* =====================================================
   REDUCE AVAILABLE BEDS
===================================================== */
async function reduceAvailableBeds(propertyId, count) {
  const property = await Product.findById(propertyId);

  if (!property) {
    throw new Error("Property not found");
  }

  property.availableBeds = Math.max(
    property.availableBeds - count,
    0
  );

  await property.save({ validateBeforeSave: false });
}

/* =====================================================
   DELETE BOOKING (ADMIN)
===================================================== */
export const deleteOrder = handleAsyncError(async (req, res, next) => {
  const booking = await Order.findById(req.params.id);

  if (!booking) {
    return next(new HandleError("Booking not found", 404));
  }

  if (booking.bookingStatus !== "Completed") {
    return next(
      new HandleError("Only completed bookings can be deleted", 400)
    );
  }

  await booking.deleteOne();

  res.status(200).json({
    success: true,
    message: "Booking deleted successfully",
  });
});