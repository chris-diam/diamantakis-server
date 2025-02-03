// src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import artworkRoutes from "./routes/artwork.routes.js";
import userRoutes from "./routes/user.routes.js";
import errorHandler from "./middleware/errorHandler.js";
import ApiError from "./utils/ApiError.js";

const app = express();

// Global Middleware
// Security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiting
const limiter = rateLimit({
  max: 100, // 100 requests
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// CORS
app.use(cors());

// Routes
app.use("/api/v1/artworks", artworkRoutes);
app.use("/api/v1/users", userRoutes);

// Handle undefined Routes
app.use("*", (req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
