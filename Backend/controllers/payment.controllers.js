import SSLCommerzPayment from "sslcommerz-lts";
import Order from "../models/order.model.js";

const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const is_live = process.env.SSLCOMMERZ_IS_LIVE === "true";

// Initialize SSLCommerz Payment
export const initPayment = async (req, res) => {
  try {
    console.log("=== Payment Init Started ===");
    console.log("Request body:", req.body);
    console.log("User ID:", req.userId);

    const { orderId } = req.body;
    const userId = req.userId;

    if (!orderId) {
      console.error("Missing orderId in request");
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Find the order
    console.log("Finding order:", orderId);
    const order = await Order.findById(orderId).populate("user");

    if (!order) {
      console.error("Order not found:", orderId);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log("Order found:", {
      id: order._id,
      userId: order.user._id,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
    });

    if (order.user._id.toString() !== userId) {
      console.error("Unauthorized access attempt");
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    if (order.paymentStatus === "paid") {
      console.error("Order already paid");
      return res.status(400).json({
        success: false,
        message: "Order already paid",
      });
    }

    // Transaction ID (unique)
    const tran_id = `TXN_${orderId}_${Date.now()}`;

    // SSLCommerz Payment Data
    const data = {
      total_amount: order.totalAmount,
      currency: "BDT",
      tran_id: tran_id,
      success_url: `${req.protocol}://${req.get("host")}/api/payment/success`,
      fail_url: `${req.protocol}://${req.get("host")}/api/payment/fail`,
      cancel_url: `${req.protocol}://${req.get("host")}/api/payment/cancel`,
      ipn_url: `${req.protocol}://${req.get("host")}/api/payment/ipn`,
      shipping_method: "Courier",
      product_name: "Food Order",
      product_category: "Food",
      product_profile: "general",
      cus_name: order.user.fullName,
      cus_email: order.user.email,
      cus_add1: order.deliveryAddress.text,
      cus_city: order.user.city || "Dhaka",
      cus_state: order.user.city || "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: order.user.mobileNumber,
      ship_name: order.user.fullName,
      ship_add1: order.deliveryAddress.text,
      ship_city: order.user.city || "Dhaka",
      ship_state: order.user.city || "Dhaka",
      ship_postcode: "1000",
      ship_country: "Bangladesh",
    };

    console.log("Initializing SSLCommerz with:", {
      store_id,
      is_live,
      orderId,
      amount: order.totalAmount,
    });

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    console.log("SSLCommerz Response:", apiResponse);

    if (apiResponse?.GatewayPageURL) {
      // Store transaction ID in order
      order.transactionId = tran_id;
      await order.save();

      return res.status(200).json({
        success: true,
        gatewayUrl: apiResponse.GatewayPageURL,
      });
    } else {
      console.error("SSLCommerz API Error:", apiResponse);
      return res.status(400).json({
        success: false,
        message: "Payment gateway initialization failed",
        details: apiResponse,
      });
    }
  } catch (error) {
    console.error("Payment initialization error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Payment initialization failed",
      error: error.message,
    });
  }
};

// Payment Success Handler
export const paymentSuccess = async (req, res) => {
  try {
    console.log("=== Payment Success Callback ===");
    console.log("Request Method:", req.method);
    console.log("Request Query:", req.query);
    console.log("Request Body:", req.body);
    console.log("Request Params:", req.params);

    // SSLCommerz sends data via query params in GET request, body in POST
    const data = req.method === "GET" ? req.query : req.body;
    const tran_id = data?.tran_id;
    const val_id = data?.val_id;

    console.log(
      "Extracted - Transaction ID:",
      tran_id,
      "Validation ID:",
      val_id,
    );

    if (!tran_id) {
      console.error("Transaction ID missing in payment success callback");
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
        receivedData: { query: req.query, body: req.body },
      });
    }

    // Find order by transaction ID
    const order = await Order.findOne({ transactionId: tran_id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Validate transaction with SSLCommerz
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validation = await sslcz.validate({ val_id });

    if (validation.status === "VALID" || validation.status === "VALIDATED") {
      // Update order payment status
      order.paymentStatus = "paid";
      order.paymentMethod = "online";
      order.validationId = val_id;
      await order.save();

      // Redirect to frontend success page
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/success/${order._id}`,
      );
    } else {
      // Redirect to frontend fail page
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/fail/${order._id}`,
      );
    }
  } catch (error) {
    console.error("Payment success error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment processing failed",
      error: error.message,
    });
  }
};

// Payment Fail Handler
export const paymentFail = async (req, res) => {
  try {
    console.log("=== Payment Fail Callback ===");
    console.log("Request Method:", req.method);
    console.log("Request Query:", req.query);
    console.log("Request Body:", req.body);

    // SSLCommerz sends data via query params in GET request, body in POST
    const data = req.method === "GET" ? req.query : req.body;
    const tran_id = data?.tran_id;

    console.log("Payment Failed - Transaction ID:", tran_id);

    if (!tran_id) {
      console.error("Transaction ID missing in payment fail callback");
      return res.status(400).send("Transaction ID is required");
    }

    const order = await Order.findOne({ transactionId: tran_id });

    if (order) {
      order.paymentStatus = "failed";
      await order.save();

      // Redirect to frontend fail page
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/fail/${order._id}`,
      );
    }

    return res.status(404).send("Order not found");
  } catch (error) {
    console.error("Payment fail error:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing payment failure",
    });
  }
};

// Payment Cancel Handler
export const paymentCancel = async (req, res) => {
  try {
    console.log("=== Payment Cancel Callback ===");
    console.log("Request Method:", req.method);
    console.log("Request Query:", req.query);
    console.log("Request Body:", req.body);

    // SSLCommerz sends data via query params in GET request, body in POST
    const data = req.method === "GET" ? req.query : req.body;
    const tran_id = data?.tran_id;

    console.log("Payment Cancelled - Transaction ID:", tran_id);

    if (!tran_id) {
      console.error("Transaction ID missing in payment cancel callback");
      return res.status(400).send("Transaction ID is required");
    }

    const order = await Order.findOne({ transactionId: tran_id });

    if (order) {
      order.paymentStatus = "cancelled";
      await order.save();

      // Redirect to frontend cancel page
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/cancel/${order._id}`,
      );
    }

    return res.status(404).send("Order not found");
  } catch (error) {
    console.error("Payment cancel error:", error);
    return res.status(500).send("Error processing payment cancellation");
  }
};

// IPN (Instant Payment Notification) Handler
export const paymentIPN = async (req, res) => {
  try {
    const { tran_id, status, val_id } = req.body;

    const order = await Order.findOne({ transactionId: tran_id });

    if (!order) {
      return res.status(404).send("Order not found");
    }

    if (status === "VALID" || status === "VALIDATED") {
      order.paymentStatus = "paid";
      order.validationId = val_id;
      await order.save();
    } else if (status === "FAILED") {
      order.paymentStatus = "failed";
      await order.save();
    } else if (status === "CANCELLED") {
      order.paymentStatus = "cancelled";
      await order.save();
    }

    return res.status(200).send("IPN received");
  } catch (error) {
    console.error("IPN error:", error);
    return res.status(500).send("IPN processing failed");
  }
};
