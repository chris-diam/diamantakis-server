// src/controllers/payment.controller.js
import Stripe from "stripe";
import ApiError from "../utils/ApiError.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = "eur", metadata } = req.body;

    if (!amount) {
      return next(new ApiError(400, "Amount is required"));
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      metadata: {
        ...metadata,
        user_id: req.user ? req.user.id : "guest",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      status: "success",
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    return next(
      new ApiError(500, error.message || "Error creating payment intent")
    );
  }
};

export const getPaymentIntentStatus = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return next(new ApiError(400, "Payment intent ID is required"));
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.status(200).json({
      status: "success",
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      },
    });
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    return next(
      new ApiError(500, error.message || "Error retrieving payment status")
    );
  }
};
