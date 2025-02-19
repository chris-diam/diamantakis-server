// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

export const protect = async (req, res, next) => {
  try {
    // 1) Get token from Authorization header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new ApiError(401, "You are not logged in. Please log in to get access.")
      );
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Add the user ID to the request object
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token. Please log in again."));
    }
    if (error.name === "TokenExpiredError") {
      return next(
        new ApiError(401, "Your token has expired. Please log in again.")
      );
    }
    return next(new ApiError(500, "Something went wrong with authentication."));
  }
};

// Optional middleware to check if the user is authenticated but proceed anyway if not
export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add the user ID to the request object
      req.user = { id: decoded.id };
    }

    // Continue regardless of authentication status
    next();
  } catch (error) {
    // Just proceed without setting req.user
    next();
  }
};
