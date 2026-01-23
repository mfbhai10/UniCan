import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  placeOrder,
  getUserOrders,
  getOwnerOrders,
  getOrderById,
  updateOrderStatus,
  getAvailableOrders,
  getDeliveryBoyOrders,
  acceptOrder,
  confirmAcceptOrder,
  rejectOrder,
  updateDeliveryStatus,
  generateDeliveryOtp,
  verifyDeliveryOtp,
  getTodayDeliveries,
  getShopEarnings,
  getMonthlyShopEarnings,
  getMonthlyDeliveryBoyEarnings,
} from "../controllers/order.controllers.js";

const orderRouter = express.Router();

orderRouter.post("/place-order", isAuth, placeOrder);
orderRouter.get("/user-orders", isAuth, getUserOrders);
orderRouter.get("/owner-orders", isAuth, getOwnerOrders);
orderRouter.get("/shop-earnings", isAuth, getShopEarnings);
orderRouter.get("/monthly-shop-earnings", isAuth, getMonthlyShopEarnings);
orderRouter.put("/update-status/:orderId", isAuth, updateOrderStatus);

// Delivery Boy Routes
orderRouter.get("/available-orders", isAuth, getAvailableOrders);
orderRouter.get("/delivery-boy-orders", isAuth, getDeliveryBoyOrders);
orderRouter.get("/today-deliveries", isAuth, getTodayDeliveries);
orderRouter.get(
  "/delivery-boy-monthly-earnings",
  isAuth,
  getMonthlyDeliveryBoyEarnings
);
orderRouter.put("/accept-order/:orderId", isAuth, acceptOrder); // Old - for backward compatibility
orderRouter.put("/confirm-accept/:orderId", isAuth, confirmAcceptOrder); // New - confirm auto-assigned order
orderRouter.put("/reject-order/:orderId", isAuth, rejectOrder); // New - reject auto-assigned order
orderRouter.put(
  "/update-delivery-status/:orderId",
  isAuth,
  updateDeliveryStatus
);

// Delivery OTP Routes
orderRouter.post("/generate-otp/:orderId", isAuth, generateDeliveryOtp);
orderRouter.post("/verify-otp/:orderId", isAuth, verifyDeliveryOtp);

orderRouter.get("/:orderId", isAuth, getOrderById);

export default orderRouter;
