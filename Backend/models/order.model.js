import mongoose from "mongoose";

const shopOrderItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

const shopOrderSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subtotal: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "delivered", "cancelled"],
      default: "pending",
    },
    shopOrderItems: [shopOrderItemSchema],
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },
    deliveryAddress: {
      text: String,
      floor: String,
      roomNo: String,
      area: String,
      floorNumber: Number, // For distance calculation (Base=-1, Ground=0, 1st=1, etc.)
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryCharge: {
      type: Number,
      default: 20,
    },
    deliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deliveryStatus: {
      type: String,
      enum: [
        "not_assigned",
        "assigned",
        "picked_up",
        "on_the_way",
        "reached",
        "delivered",
      ],
      default: "not_assigned",
    },
    assignmentExpiry: {
      type: Date, // When the current assignment expires (5 min from assignment)
    },
    rejectedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Track which delivery boys rejected
      },
    ],
    assignmentAttempts: {
      type: Number,
      default: 0, // How many times auto-assignment tried
    },
    deliveryOtp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
    },
    transactionId: {
      type: String,
    },
    validationId: {
      type: String,
    },
    shopOrder: [shopOrderSchema],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
