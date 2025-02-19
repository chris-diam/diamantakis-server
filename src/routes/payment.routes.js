// src/routes/payment.routes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createPaymentIntent,
  getPaymentIntentStatus,
} from "../controllers/payment.controller.js";
import { handleStripeWebhook } from "../controllers/webhook.controller.js";

const router = express.Router();

// Protected route - requires authentication
router.post("/create-payment-intent", protect, createPaymentIntent);

// Public route for guest checkout
// Using the same controller for both authenticated and guest users
router.post("/guest/create-payment-intent", createPaymentIntent);

// Get payment status (can be used by both guests and authenticated users)
router.get("/status/:paymentIntentId", getPaymentIntentStatus);

// Stripe webhook
router.post("/webhook", handleStripeWebhook);

export default router;
