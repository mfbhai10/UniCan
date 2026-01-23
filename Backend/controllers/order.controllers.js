import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";
import { sendDeliveryOtp } from "../utils/mail.js";
import crypto from "crypto";

// Helper function to auto-assign delivery boy
const autoAssignDeliveryBoy = async (orderId) => {
  try {
    console.log(`🚀 Auto-assignment triggered for order ${orderId}`);

    const order = await Order.findById(orderId);
    if (!order || order.deliveryStatus !== "not_assigned") {
      console.log(
        `Order ${orderId} check failed - Order exists: ${!!order}, Status: ${order?.deliveryStatus}`,
      );
      return;
    }

    console.log(
      `✅ Order ${orderId} is ready for assignment. Checking all shops...`,
    );

    // Check if all shop orders are ready
    const allReady = order.shopOrder.every(
      (so) =>
        so.status === "ready" ||
        so.status === "delivered" ||
        so.status === "cancelled",
    );
    if (!allReady) {
      console.log(`❌ Not all shop orders are ready for order ${orderId}`);
      return; // Wait until all shops are ready
    }

    console.log(`✅ All shop orders ready for order ${orderId}`);

    // Prevent infinite loop - max 10 attempts
    if (order.assignmentAttempts >= 10) {
      console.error("Max assignment attempts reached for order:", orderId);
      return;
    }

    // Find all delivery boys who haven't rejected this order
    const deliveryBoys = await User.find({
      role: "deliveryBoy",
      _id: { $nin: order.rejectedBy || [] }, // Exclude those who rejected
    });

    console.log(
      `🔍 Found ${deliveryBoys.length} available delivery boys for order ${orderId}`,
    );

    if (deliveryBoys.length === 0) {
      console.error("❌ No available delivery boys for order:", orderId);
      return;
    }

    // Get today's delivery count for each delivery boy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deliveryBoysWithCount = await Promise.all(
      deliveryBoys.map(async (db) => {
        const count = await Order.countDocuments({
          deliveryBoy: db._id,
          deliveryStatus: { $in: ["delivered"] },
          createdAt: { $gte: today },
        });

        // Check if currently has an active delivery
        const activeDelivery = await Order.countDocuments({
          deliveryBoy: db._id,
          deliveryStatus: { $in: ["assigned", "picked_up", "on_the_way"] },
        });

        return {
          deliveryBoy: db,
          count: count,
          isAvailable: activeDelivery === 0,
        };
      }),
    );

    // Prioritize: available > less deliveries done
    deliveryBoysWithCount.sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) {
        return b.isAvailable - a.isAvailable; // Available first
      }
      return a.count - b.count; // Then by count (less = higher priority)
    });

    const selectedDB = deliveryBoysWithCount[0].deliveryBoy;

    console.log(
      `👉 Selected delivery boy: ${selectedDB.fullName} (ID: ${selectedDB._id})`,
    );

    // Assign with 60 second expiry
    const assignmentExpiry = new Date(Date.now() + 60 * 1000); // 60 seconds

    order.deliveryBoy = selectedDB._id;
    order.deliveryStatus = "assigned";
    order.assignmentExpiry = assignmentExpiry;
    order.assignmentAttempts = (order.assignmentAttempts || 0) + 1;
    await order.save();

    console.log(
      `✅ Order ${orderId} auto-assigned to delivery boy ${selectedDB.fullName} (ID: ${selectedDB._id}). Expiry: ${assignmentExpiry}`,
    );

    // TODO: Send push notification to delivery boy

    // Set timeout to check if accepted after 60 seconds
    setTimeout(async () => {
      await checkAssignmentExpiry(orderId);
    }, 60 * 1000);
  } catch (error) {
    console.error("Auto assign delivery boy error:", error);
  }
};

// Helper function to check if assignment expired
const checkAssignmentExpiry = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) return;

    // If still in "assigned" status and expiry time passed
    if (
      order.deliveryStatus === "assigned" &&
      order.assignmentExpiry &&
      new Date() > order.assignmentExpiry
    ) {
      console.log(`Assignment expired for order ${orderId}, reassigning...`);

      // Add current delivery boy to rejected list
      if (order.deliveryBoy) {
        order.rejectedBy = order.rejectedBy || [];
        order.rejectedBy.push(order.deliveryBoy);
      }

      // Reset for reassignment
      order.deliveryBoy = null;
      order.deliveryStatus = "not_assigned";
      order.assignmentExpiry = null;
      await order.save();

      // Try to assign to another delivery boy
      await autoAssignDeliveryBoy(orderId);
    }
  } catch (error) {
    console.error("Check assignment expiry error:", error);
  }
};

export const placeOrder = async (req, res) => {
  try {
    const { paymentMethod, deliveryAddress, totalAmount, shopOrder } = req.body;

    if (!paymentMethod || !deliveryAddress || !totalAmount || !shopOrder) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Fixed delivery charge
    const DELIVERY_CHARGE = 20;

    const order = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      deliveryCharge: DELIVERY_CHARGE,
      shopOrder,
    });

    await order.populate("user", "fullName email mobileNumber");
    await order.populate({
      path: "shopOrder.shop",
      select: "name address city",
    });
    await order.populate({
      path: "shopOrder.shopOrderItems.item",
      select: "name price image",
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error("Place order error:", error);
    return res.status(500).json({ message: `Place order failed: ${error}` });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("user", "fullName email mobileNumber")
      .populate({
        path: "shopOrder.shop",
        select: "name address city image",
      })
      .populate({
        path: "shopOrder.shopOrderItems.item",
        select: "name price image category",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get user orders error:", error);
    return res.status(500).json({ message: `Get orders failed: ${error}` });
  }
};

export const getOwnerOrders = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const orders = await Order.find({
      "shopOrder.shop": shop._id,
    })
      .populate("user", "fullName email mobileNumber")
      .populate({
        path: "shopOrder.shop",
        select: "name address city",
      })
      .populate({
        path: "shopOrder.shopOrderItems.item",
        select: "name price image category",
      })
      .sort({ createdAt: -1 });

    // Filter only the shopOrder items that belong to this owner's shop
    const filteredOrders = orders.map((order) => {
      const relevantShopOrders = order.shopOrder.filter(
        (so) => so.shop._id.toString() === shop._id.toString(),
      );

      return {
        _id: order._id,
        user: order.user,
        paymentMethod: order.paymentMethod,
        deliveryAddress: order.deliveryAddress,
        totalAmount: relevantShopOrders.reduce(
          (acc, so) => acc + so.subtotal,
          0,
        ),
        shopOrder: relevantShopOrders,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    return res.status(200).json(filteredOrders);
  } catch (error) {
    console.error("Get owner orders error:", error);
    return res.status(500).json({ message: `Get orders failed: ${error}` });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "fullName email mobileNumber")
      .populate("deliveryBoy", "fullName mobileNumber")
      .populate({
        path: "shopOrder.shop",
        select: "name address city image",
      })
      .populate({
        path: "shopOrder.shopOrderItems.item",
        select: "name price image category",
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Get order by id error:", error);
    return res.status(500).json({ message: `Get order failed: ${error}` });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = [
      "pending",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find the shop owned by this user
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Find the order and update the status for this shop's order only
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prevent status reversal if delivery boy already picked up the order
    if (
      (status === "pending" ||
        status === "preparing" ||
        status === "cancelled") &&
      order.deliveryStatus &&
      (order.deliveryStatus === "picked_up" ||
        order.deliveryStatus === "on_the_way")
    ) {
      return res.status(400).json({
        message:
          "Cannot change order status. Delivery boy has already picked up the order.",
      });
    }

    // Find and update the shop order that belongs to this owner
    let updated = false;
    let previousStatus = null;
    order.shopOrder.forEach((shopOrder) => {
      if (shopOrder.shop.toString() === shop._id.toString()) {
        previousStatus = shopOrder.status; // Store previous status
        shopOrder.status = status;
        updated = true;
        console.log(
          `✅ Updated shop order status from ${previousStatus} to ${status} for shop ${shop._id}`,
        );
      }
    });

    if (!updated) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this order" });
    }

    // Check if status is being changed from "ready" to something else
    const isStatusReversal =
      previousStatus === "ready" &&
      (status === "pending" ||
        status === "preparing" ||
        status === "cancelled");

    // If status is reversed, handle delivery boy reassignment
    if (isStatusReversal) {
      // Check if all shop orders are not ready anymore
      const anyReady = order.shopOrder.some((so) => so.status === "ready");

      if (!anyReady) {
        // No shop is ready, unassign delivery boy and clear rejections
        order.deliveryBoy = null;
        order.deliveryStatus = "not_assigned";
        order.assignmentExpiry = null;
        order.assignmentAttempts = 0;
        order.rejectedBy = [];
        console.log(
          `Order ${orderId} status reversed to ${status}. Delivery boy unassigned and rejections cleared.`,
        );
      } else {
        // Some shops are still ready, but clear rejections to allow reassignment
        order.assignmentAttempts = 0;
        order.rejectedBy = [];
        console.log(
          `Order ${orderId} status reversed to ${status}. Rejections cleared for fresh assignment.`,
        );
      }
    }

    await order.save();
    console.log(
      `✅ Order ${orderId} saved with shop order status: ${order.shopOrder.map((so) => `${so.shop}: ${so.status}`).join(", ")}`,
    );

    // If status is "ready", trigger auto-assignment
    if (status === "ready") {
      console.log(
        `🔔 Status changed to "ready" for order ${orderId}. Triggering auto-assignment...`,
      );
      // Run auto-assignment asynchronously (don't wait)
      autoAssignDeliveryBoy(orderId).catch((err) =>
        console.error("❌ Auto-assignment failed:", err),
      );
    }

    // Populate the order before sending response
    await order.populate("user", "fullName email mobileNumber");
    await order.populate({
      path: "shopOrder.shop",
      select: "name address city image",
    });
    await order.populate({
      path: "shopOrder.shopOrderItems.item",
      select: "name price image category",
    });

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res
      .status(500)
      .json({ message: `Update order status failed: ${error}` });
  }
};

// Delivery Boy Controllers
export const getAvailableOrders = async (req, res) => {
  try {
    // Get orders that are ready for pickup and not assigned to any delivery boy
    const orders = await Order.find({
      deliveryStatus: "not_assigned",
      "shopOrder.status": "ready",
    })
      .populate("user", "fullName email mobileNumber")
      .populate({
        path: "shopOrder.shop",
        select: "name address city image",
      })
      .populate({
        path: "shopOrder.shopOrderItems.item",
        select: "name price image category",
      })
      .sort({ "deliveryAddress.floorNumber": 1, createdAt: -1 }); // Sort by nearest floor first (Ground=0), then by time

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get available orders error:", error);
    return res
      .status(500)
      .json({ message: `Get available orders failed: ${error}` });
  }
};

export const getDeliveryBoyOrders = async (req, res) => {
  try {
    console.log(`📦 Fetching orders for delivery boy ID: ${req.userId}`);

    const orders = await Order.find({ deliveryBoy: req.userId })
      .populate("user", "fullName email mobileNumber")
      .populate("deliveryBoy", "fullName mobileNumber")
      .populate({
        path: "shopOrder.shop",
        select: "name address city image",
      })
      .populate({
        path: "shopOrder.shopOrderItems.item",
        select: "name price image category",
      })
      .sort({ createdAt: -1 });

    console.log(
      `📦 Found ${orders.length} orders for delivery boy ${req.userId}`,
    );

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get delivery boy orders error:", error);
    return res.status(500).json({ message: `Get orders failed: ${error}` });
  }
};

// Accept auto-assigned order (delivery boy confirms)
export const confirmAcceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if this delivery boy is the one assigned
    if (order.deliveryBoy.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "This order is not assigned to you" });
    }

    // Check if still in assigned status
    if (order.deliveryStatus !== "assigned") {
      return res
        .status(400)
        .json({ message: "Order is no longer in assigned status" });
    }

    // Check if assignment expired
    if (order.assignmentExpiry && new Date() > order.assignmentExpiry) {
      return res.status(400).json({ message: "Assignment has expired" });
    }

    // Clear expiry - order is confirmed
    order.assignmentExpiry = null;
    await order.save();

    await order.populate("user", "fullName email mobileNumber");
    await order.populate("deliveryBoy", "fullName mobileNumber");
    await order.populate({
      path: "shopOrder.shop",
      select: "name address city image",
    });
    await order.populate({
      path: "shopOrder.shopOrderItems.item",
      select: "name price image category",
    });

    return res.status(200).json({
      message: "Order accepted successfully",
      order,
    });
  } catch (error) {
    console.error("Confirm accept order error:", error);
    return res
      .status(500)
      .json({ message: `Confirm accept order failed: ${error}` });
  }
};

// Reject auto-assigned order
export const rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if this delivery boy is the one assigned
    if (order.deliveryBoy.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "This order is not assigned to you" });
    }

    // Check if still in assigned status
    if (order.deliveryStatus !== "assigned") {
      return res
        .status(400)
        .json({ message: "Order is no longer in assigned status" });
    }

    // Add to rejected list
    order.rejectedBy = order.rejectedBy || [];
    order.rejectedBy.push(req.userId);

    // Reset for reassignment
    order.deliveryBoy = null;
    order.deliveryStatus = "not_assigned";
    order.assignmentExpiry = null;
    await order.save();

    // Try to assign to another delivery boy
    autoAssignDeliveryBoy(orderId).catch((err) =>
      console.error("Reassignment failed:", err),
    );

    return res.status(200).json({
      message: "Order rejected. It will be assigned to another delivery boy.",
    });
  } catch (error) {
    console.error("Reject order error:", error);
    return res.status(500).json({ message: `Reject order failed: ${error}` });
  }
};

// Old accept order function (kept for backward compatibility - can be removed)
export const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Use atomic findOneAndUpdate to prevent race condition
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        deliveryStatus: "not_assigned", // Only update if still not assigned
      },
      {
        deliveryBoy: req.userId,
        deliveryStatus: "assigned",
      },
      { new: true }, // Return the updated document
    );

    if (!order) {
      return res.status(400).json({
        message: "Order not found or already assigned to another delivery boy",
      });
    }

    await order.populate("user", "fullName email mobileNumber");
    await order.populate("deliveryBoy", "fullName mobileNumber");
    await order.populate({
      path: "shopOrder.shop",
      select: "name address city image",
    });
    await order.populate({
      path: "shopOrder.shopOrderItems.item",
      select: "name price image category",
    });

    return res.status(200).json({
      message: "Order accepted successfully",
      order,
    });
  } catch (error) {
    console.error("Accept order error:", error);
    return res.status(500).json({ message: `Accept order failed: ${error}` });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus } = req.body;

    if (!deliveryStatus) {
      return res.status(400).json({ message: "Delivery status is required" });
    }

    const validStatuses = [
      "assigned",
      "picked_up",
      "on_the_way",
      "reached",
      "delivered",
    ];
    if (!validStatuses.includes(deliveryStatus)) {
      return res.status(400).json({ message: "Invalid delivery status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.deliveryBoy.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this order" });
    }

    order.deliveryStatus = deliveryStatus;
    await order.save();

    await order.populate("user", "fullName email mobileNumber");
    await order.populate("deliveryBoy", "fullName mobileNumber");
    await order.populate({
      path: "shopOrder.shop",
      select: "name address city image",
    });
    await order.populate({
      path: "shopOrder.shopOrderItems.item",
      select: "name price image category",
    });

    return res.status(200).json({
      message: "Delivery status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update delivery status error:", error);
    return res
      .status(500)
      .json({ message: `Update delivery status failed: ${error}` });
  }
};

// Generate and send delivery OTP to user
export const generateDeliveryOtp = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate(
      "user",
      "fullName email mobileNumber",
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.deliveryBoy.toString() !== req.userId) {
      return res.status(403).json({
        message: "You are not authorized to generate OTP for this order",
      });
    }

    if (order.deliveryStatus !== "reached") {
      return res.status(400).json({
        message:
          "OTP can only be generated when delivery boy has reached the destination",
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set OTP expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    order.deliveryOtp = otp;
    order.otpExpiresAt = expiresAt;
    await order.save();

    // Send OTP to user's email
    await sendDeliveryOtp(order.user.email, otp, {
      orderId: order._id,
      totalAmount: order.totalAmount,
    });

    return res.status(200).json({
      message: "OTP sent to customer's email successfully",
      otpSent: true,
    });
  } catch (error) {
    console.error("Generate delivery OTP error:", error);
    return res.status(500).json({ message: `Generate OTP failed: ${error}` });
  }
};

// Verify delivery OTP
export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.deliveryBoy.toString() !== req.userId) {
      return res.status(403).json({
        message: "You are not authorized to verify OTP for this order",
      });
    }

    if (!order.deliveryOtp || !order.otpExpiresAt) {
      return res
        .status(400)
        .json({ message: "No OTP generated for this order" });
    }

    // Check if OTP has expired
    if (new Date() > order.otpExpiresAt) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // Verify OTP
    if (order.deliveryOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP verified successfully, mark order as delivered
    order.deliveryStatus = "delivered";
    order.deliveryOtp = undefined;
    order.otpExpiresAt = undefined;

    // Update all shop orders to delivered
    order.shopOrder.forEach((shopOrder) => {
      if (shopOrder.status === "ready") {
        shopOrder.status = "delivered";
      }
    });

    await order.save();

    await order.populate("user", "fullName email mobileNumber");
    await order.populate("deliveryBoy", "fullName mobileNumber");
    await order.populate({
      path: "shopOrder.shop",
      select: "name address city image",
    });
    await order.populate({
      path: "shopOrder.shopOrderItems.item",
      select: "name price image category",
    });

    return res.status(200).json({
      message: "OTP verified successfully. Order delivered!",
      order,
    });
  } catch (error) {
    console.error("Verify delivery OTP error:", error);
    return res.status(500).json({ message: `Verify OTP failed: ${error}` });
  }
};

// Get today's deliveries and earnings for delivery boy
export const getTodayDeliveries = async (req, res) => {
  try {
    const userId = req.userId;

    // Get start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find all delivered orders by this delivery boy today
    const todayOrders = await Order.find({
      deliveryBoy: userId,
      deliveryStatus: "delivered",
      updatedAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("user", "fullName mobileNumber")
      .populate({
        path: "shopOrder.shop",
        select: "name address city",
      })
      .populate({
        path: "shopOrder.shopOrderItems.item",
        select: "name price",
      })
      .sort({ updatedAt: -1 });

    // Calculate earnings (fixed delivery fee of ৳20 per order)
    const deliveryFeePerOrder = 20;
    let totalEarnings = 0;
    let totalDeliveries = todayOrders.length;

    const deliveriesWithEarnings = todayOrders.map((order) => {
      const deliveryFee = deliveryFeePerOrder;
      totalEarnings += deliveryFee;

      return {
        orderId: order._id,
        customerName: order.user.fullName,
        customerPhone: order.user.mobileNumber,
        deliveryAddress: order.deliveryAddress.text,
        totalAmount: order.totalAmount,
        deliveryFee: deliveryFee,
        deliveredAt: order.updatedAt,
        itemCount: order.shopOrder.reduce(
          (acc, so) => acc + so.shopOrderItems.length,
          0,
        ),
        shops: order.shopOrder.map((so) => so.shop.name),
      };
    });

    return res.status(200).json({
      totalDeliveries,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      deliveries: deliveriesWithEarnings,
    });
  } catch (error) {
    console.error("Get today deliveries error:", error);
    return res
      .status(500)
      .json({ message: `Get today deliveries failed: ${error}` });
  }
};

// Get shop earnings for owner
export const getShopEarnings = async (req, res) => {
  try {
    const userId = req.userId;

    // Get start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find all delivered orders containing owner's shop today
    const todayOrders = await Order.find({
      "shopOrder.owner": userId,
      "shopOrder.status": "delivered",
      updatedAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("user", "fullName mobileNumber")
      .populate("deliveryBoy", "fullName mobileNumber")
      .populate({
        path: "shopOrder.shop",
        select: "name address city",
      })
      .populate({
        path: "shopOrder.shopOrderItems.item",
        select: "name price category",
      })
      .sort({ updatedAt: -1 });

    let totalEarnings = 0;
    let totalOrders = 0;

    const ordersWithEarnings = todayOrders
      .map((order) => {
        // Calculate earnings only from owner's shop orders
        const ownerShopOrders = order.shopOrder.filter(
          (so) => so.owner.toString() === userId,
        );

        const shopEarnings = ownerShopOrders.reduce((acc, shopOrder) => {
          return acc + shopOrder.subtotal;
        }, 0);

        totalEarnings += shopEarnings;
        if (ownerShopOrders.length > 0) totalOrders++;

        return {
          orderId: order._id,
          customerName: order.user.fullName,
          customerPhone: order.user.mobileNumber,
          deliveryBoyName: order.deliveryBoy?.fullName || "N/A",
          deliveryAddress: order.deliveryAddress.text,
          totalAmount: order.totalAmount,
          shopEarnings: shopEarnings,
          deliveredAt: order.updatedAt,
          paymentMethod: order.paymentMethod,
          items: ownerShopOrders.flatMap((so) =>
            so.shopOrderItems.map((item) => ({
              name: item.item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          ),
        };
      })
      .filter((order) => order.shopEarnings > 0);

    return res.status(200).json({
      totalOrders,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      orders: ordersWithEarnings,
    });
  } catch (error) {
    console.error("Get shop earnings error:", error);
    return res
      .status(500)
      .json({ message: `Get shop earnings failed: ${error}` });
  }
};

// Get monthly shop earnings for owner
export const getMonthlyShopEarnings = async (req, res) => {
  try {
    const userId = req.userId;

    // Get start and end of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Find all delivered orders containing owner's shop this month
    const monthlyOrders = await Order.find({
      "shopOrder.owner": userId,
      "shopOrder.status": "delivered",
      updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .populate("user", "fullName mobileNumber")
      .populate("deliveryBoy", "fullName mobileNumber")
      .populate({
        path: "shopOrder.shop",
        select: "name address city",
      })
      .populate({
        path: "shopOrder.shopOrderItems.item",
        select: "name price category",
      })
      .sort({ updatedAt: -1 });

    let totalEarnings = 0;
    let totalOrders = 0;
    const dailyEarnings = {};

    const ordersWithEarnings = monthlyOrders
      .map((order) => {
        // Calculate earnings only from owner's shop orders
        const ownerShopOrders = order.shopOrder.filter(
          (so) => so.owner.toString() === userId,
        );

        const shopEarnings = ownerShopOrders.reduce((acc, shopOrder) => {
          return acc + shopOrder.subtotal;
        }, 0);

        totalEarnings += shopEarnings;
        if (ownerShopOrders.length > 0) totalOrders++;

        // Track daily earnings
        const orderDate = new Date(order.updatedAt).toLocaleDateString();
        if (!dailyEarnings[orderDate]) {
          dailyEarnings[orderDate] = 0;
        }
        dailyEarnings[orderDate] += shopEarnings;

        return {
          orderId: order._id,
          customerName: order.user.fullName,
          customerPhone: order.user.mobileNumber,
          deliveryBoyName: order.deliveryBoy?.fullName || "N/A",
          deliveryAddress: order.deliveryAddress.text,
          totalAmount: order.totalAmount,
          shopEarnings: shopEarnings,
          deliveredAt: order.updatedAt,
          paymentMethod: order.paymentMethod,
          items: ownerShopOrders.flatMap((so) =>
            so.shopOrderItems.map((item) => ({
              name: item.item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          ),
        };
      })
      .filter((order) => order.shopEarnings > 0);

    return res.status(200).json({
      totalOrders,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      dailyEarnings,
      orders: ordersWithEarnings,
      month: now.toLocaleString("default", { month: "long", year: "numeric" }),
    });
  } catch (error) {
    console.error("Get monthly shop earnings error:", error);
    return res
      .status(500)
      .json({ message: `Get monthly shop earnings failed: ${error}` });
  }
};

export const getMonthlyDeliveryBoyEarnings = async (req, res) => {
  try {
    const userId = req.userId;

    // Get start and end of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Find all delivered orders for this delivery boy this month
    const monthlyOrders = await Order.find({
      deliveryBoy: userId,
      deliveryStatus: "delivered",
      updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .populate("user", "fullName mobileNumber")
      .populate({
        path: "shopOrder.shop",
        select: "name address city",
      })
      .sort({ updatedAt: -1 });

    let totalEarnings = 0;
    let totalDeliveries = monthlyOrders.length;
    const dailyEarnings = {};

    const ordersWithEarnings = monthlyOrders.map((order) => {
      // Delivery fee is the delivery charge
      const deliveryFee = order.deliveryCharge || 20; // Default 20 if not set
      totalEarnings += deliveryFee;

      // Track daily earnings
      const orderDate = new Date(order.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      if (!dailyEarnings[orderDate]) {
        dailyEarnings[orderDate] = { earnings: 0, deliveries: 0 };
      }
      dailyEarnings[orderDate].earnings += deliveryFee;
      dailyEarnings[orderDate].deliveries += 1;

      return {
        orderId: order._id,
        customerName: order.user.fullName,
        customerPhone: order.user.mobileNumber,
        deliveryAddress: order.deliveryAddress.text,
        shops: order.shopOrder.map((so) => so.shop.name),
        totalAmount: order.totalAmount,
        deliveryFee: deliveryFee,
        deliveredAt: order.updatedAt,
        paymentMethod: order.paymentMethod,
      };
    });

    // Convert daily earnings to array format for frontend
    const dailyBreakdown = Object.keys(dailyEarnings)
      .map((date) => ({
        date,
        earnings: Math.round(dailyEarnings[date].earnings * 100) / 100,
        deliveries: dailyEarnings[date].deliveries,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.status(200).json({
      totalDeliveries,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      dailyBreakdown,
      orders: ordersWithEarnings,
      month: now.toLocaleString("default", { month: "long", year: "numeric" }),
    });
  } catch (error) {
    console.error("Get monthly delivery boy earnings error:", error);
    return res
      .status(500)
      .json({ message: `Get monthly delivery boy earnings failed: ${error}` });
  }
};
