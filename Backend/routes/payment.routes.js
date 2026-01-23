import express from "express";
import {
  initPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN,
} from "../controllers/payment.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const paymentRouter = express.Router();

// Test route (no auth needed)
paymentRouter.get("/test", (req, res) => {
  res.json({ message: "Payment router is working!" });
});

// Initialize payment (protected route)
paymentRouter.post("/init", isAuth, initPayment);

// IPN callback (not protected - SSLCommerz will call this)
paymentRouter.post("/ipn", paymentIPN);

// Success callback (not protected - redirects from SSLCommerz)
// Accept both GET and POST as SSLCommerz uses GET for redirects
paymentRouter.get("/success", paymentSuccess);
paymentRouter.post("/success", paymentSuccess);

// Fail callback (not protected - redirects from SSLCommerz)
paymentRouter.get("/fail", paymentFail);
paymentRouter.post("/fail", paymentFail);

// Cancel callback (not protected - redirects from SSLCommerz)
paymentRouter.get("/cancel", paymentCancel);
paymentRouter.post("/cancel", paymentCancel);

export default paymentRouter;
