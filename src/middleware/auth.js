import jwt from "jsonwebtoken";
import { promisify } from "util";
import User from "../models/User.js";
import config from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";

export const protect = catchAsync(async (req, res, next) => {
  // Get token
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError(401, "Please log in to access this resource"));
  }

  // Verify token
  const decoded = await promisify(jwt.verify)(token, config.jwtSecret);

  // Check if user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new ApiError(401, "User no longer exists"));
  }

  // Grant access
  req.user = user;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You do not have permission to perform this action")
      );
    }
    next();
  };
};
