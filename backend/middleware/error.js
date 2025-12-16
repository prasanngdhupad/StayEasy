import HandleError from "../utils/handlerError.js";

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    const message = `Invalid resource ID: ${err.path}`;
    err = new HandleError(message, 400);
  }

  // Duplicate key error (email, phone, etc.)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists. Please login or use a different ${field}.`;
    err = new HandleError(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
