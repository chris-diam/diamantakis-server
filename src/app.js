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
import paymentRoutes from "./routes/payment.routes.js";
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

// CORS
const corsOptions = {
  origin: function (origin, callback) {
    // List of allowed origins
    const allowedOrigins = [
      "http://localhost:5173", // Vite default port
      "http://localhost:5174", // Alternative Vite port
      "http://localhost:3000", // React default port
      "https://diamantakis-server.onrender.com", // Production server
      "https://diamantakis-gallery.netlify.app", // Frontend deployment (if applicable)
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Origin",
    "X-Requested-With",
    "Accept",
    "x-client-key",
    "x-client-token",
    "x-client-secret",
    "Authorization",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Special handling for Stripe webhook route
app.use("/api/v1/payments/webhook", express.raw({ type: "application/json" }));

// Body parser for all other routes
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Routes
app.use("/api/v1/artworks", artworkRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/payments", paymentRoutes);

// Handle undefined Routes
app.use("*", (req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
