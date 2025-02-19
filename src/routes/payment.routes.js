// src/routes/payment.routes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validateGuestCheckout } from "../middleware/guestMiddleware.js";
import {
  createPaymentIntent,
  createGuestPaymentIntent,
  getPaymentIntentStatus,
} from "../controllers/payment.controller.js";
import { handleStripeWebhook } from "../controllers/webhook.controller.js";

const router = express.Router();

// Protected route - requires authentication
router.post("/create-payment-intent", protect, createPaymentIntent);

// Public route for guest checkout
router.post(
  "/guest/create-payment-intent",
  validateGuestCheckout,
  createGuestPaymentIntent
);

// Get payment status (can be used by both guests and authenticated users)
router.get("/status/:paymentIntentId", getPaymentIntentStatus);

// Stripe webhook
// Note: The raw body handling is now in app.js
router.post("/webhook", handleStripeWebhook);

export default router;
