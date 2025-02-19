// server/controllers/paymentController.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "eur", metadata } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      metadata,
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
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// server/routes/paymentRoutes.js
const express = require("express");
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/create-payment-intent",
  protect,
  paymentController.createPaymentIntent
);

module.exports = router;
