// src/middleware/guestMiddleware.js
import ApiError from "../utils/ApiError.js";

// This middleware allows both authenticated users and guests to access routes
export const allowGuests = (req, res, next) => {
  // If user is authenticated (from previous middleware), proceed
  if (req.user) {
    return next();
  }

  // For guest users, set a guest identifier
  req.isGuest = true;
  req.guestId = req.body.guestId || `guest_${Date.now()}`;

  next();
};

// Validate guest checkout data
export const validateGuestCheckout = (req, res, next) => {
  const { email, firstName, lastName, address, city, state, zipCode, country } =
    req.body;

  // Basic validation
  if (
    !email ||
    !firstName ||
    !lastName ||
    !address ||
    !city ||
    !state ||
    !zipCode ||
    !country
  ) {
    return next(
      new ApiError(400, "Missing required guest checkout information")
    );
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ApiError(400, "Invalid email format"));
  }

  next();
};
