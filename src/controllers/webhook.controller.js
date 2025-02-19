// src/controllers/webhook.controller.js
import Stripe from "stripe";
import ApiError from "../utils/ApiError.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const handleStripeWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;
      // Add other event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    return next(
      new ApiError(500, `Error processing webhook: ${error.message}`)
    );
  }
};

async function handlePaymentIntentSucceeded(paymentIntent) {
  // Extract metadata
  const { user_id, order_items } = paymentIntent.metadata;

  try {
    // TODO: Implement order creation in your database
    // This would typically:
    // 1. Create an order record
    // 2. Link it to the user (or store guest information)
    // 3. Update inventory
    // 4. Send confirmation emails

    console.log(`Payment succeeded for user: ${user_id}`);
    console.log(
      `Payment amount: ${paymentIntent.amount / 100} ${paymentIntent.currency}`
    );
    console.log(`Payment ID: ${paymentIntent.id}`);

    // For testing, just log the order items if present
    if (order_items) {
      try {
        const items = JSON.parse(order_items);
        console.log("Order items:", items);
      } catch (e) {
        console.error("Failed to parse order items:", e);
      }
    }
  } catch (error) {
    console.error("Error handling successful payment:", error);
    // Consider implementing retry logic or alerting system
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  const { user_id } = paymentIntent.metadata;

  try {
    // TODO: Implement failed payment handling
    // This would typically:
    // 1. Log the failure
    // 2. Notify the customer
    // 3. Update any pending orders

    console.log(`Payment failed for user: ${user_id}`);
    console.log(
      `Failure reason: ${
        paymentIntent.last_payment_error?.message || "Unknown"
      }`
    );
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}
