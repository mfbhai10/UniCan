import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import {
  FaCheckCircle,
  FaMotorcycle,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaShoppingBag,
  FaClock,
  FaStore,
  FaBox,
  FaTruck,
  FaKey,
} from "react-icons/fa";
import { MdPayment, MdRestaurant } from "react-icons/md";
import { BiTimeFive, BiArrowBack } from "react-icons/bi";

function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchOrderDetails();
    // Refresh order details every 30 seconds
    const interval = setInterval(fetchOrderDetails, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrderDetails = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    }
    try {
      const response = await fetch(`${serverUrl}/api/order/${orderId}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📦 Order data received:", {
          orderId: data._id,
          shopOrders: data.shopOrder.map((so) => ({
            shop: so.shop.name,
            status: so.status,
          })),
          deliveryStatus: data.deliveryStatus,
        });
        // Force React to re-render by creating a new object reference
        setOrder({ ...data });
        setError(null);
        setLastUpdated(new Date());
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to fetch order details. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getShopStatusProgress = (status) => {
    const statuses = [
      "pending",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ];
    const index = statuses.indexOf(status);
    return {
      index,
      percentage: status === "cancelled" ? 0 : (index / 3) * 100,
    };
  };

  const getDeliveryStatusProgress = (status) => {
    const statuses = [
      "not_assigned",
      "assigned",
      "picked_up",
      "on_the_way",
      "reached",
      "delivered",
    ];
    const index = statuses.indexOf(status);
    return {
      index,
      percentage: (index / 5) * 100,
    };
  };

  const getShopStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "preparing":
        return "bg-blue-500";
      case "ready":
        return "bg-green-500";
      case "delivered":
        return "bg-gray-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case "not_assigned":
        return "bg-gray-400";
      case "assigned":
        return "bg-blue-500";
      case "picked_up":
        return "bg-yellow-500";
      case "on_the_way":
        return "bg-orange-500";
      case "reached":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const renderTrackingTimeline = () => {
    if (!order) return null;

    const deliveryProgress = getDeliveryStatusProgress(order.deliveryStatus);
    const allShopsReady = order.shopOrder.every(
      (so) => so.status === "ready" || so.status === "delivered",
    );

    const steps = [
      {
        icon: <FaShoppingBag />,
        title: "Order Placed",
        description: "Your order has been received",
        status: "completed",
        color: "bg-green-500",
      },
      {
        icon: <MdRestaurant />,
        title: "Preparing Food",
        description: allShopsReady
          ? "All items are ready"
          : "Restaurant is preparing your order",
        status: allShopsReady
          ? "completed"
          : deliveryProgress.index >= 0
            ? "current"
            : "pending",
        color: allShopsReady ? "bg-green-500" : "bg-blue-500",
      },
      {
        icon: <FaMotorcycle />,
        title: "Delivery Partner",
        description:
          deliveryProgress.index >= 2
            ? order.deliveryStatus === "picked_up"
              ? "Order picked up from restaurant"
              : order.deliveryStatus === "on_the_way"
                ? "Delivery partner is on the way"
                : order.deliveryStatus === "reached"
                  ? "Delivery partner reached your location"
                  : "Delivery partner is on the way"
            : deliveryProgress.index === 1
              ? "Delivery partner assigned"
              : "Waiting for delivery partner",
        status:
          deliveryProgress.index >= 2
            ? "current"
            : deliveryProgress.index === 1
              ? "current"
              : allShopsReady
                ? "pending"
                : "pending",
        color:
          deliveryProgress.index >= 4
            ? "bg-purple-500"
            : deliveryProgress.index >= 2
              ? "bg-orange-500"
              : deliveryProgress.index === 1
                ? "bg-blue-500"
                : "bg-gray-300",
      },
      {
        icon: <FaCheckCircle />,
        title: "Delivered",
        description:
          order.deliveryStatus === "delivered"
            ? "Order delivered successfully"
            : "Waiting for delivery",
        status: order.deliveryStatus === "delivered" ? "completed" : "pending",
        color:
          order.deliveryStatus === "delivered" ? "bg-green-500" : "bg-gray-300",
      },
    ];

    return (
      <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FaTruck className="text-[#ff4d2d]" />
          Order Tracking
        </h2>

        <div className="relative">
          {/* Progress Line */}
          <div
            className="absolute left-6 top-6 w-1 bg-gray-200"
            style={{ height: "calc(100% - 48px)" }}
          ></div>
          <div
            className="absolute left-6 top-6 w-1 bg-[#ff4d2d] transition-all duration-500"
            style={{
              height: `calc((100% - 48px) * ${
                order.deliveryStatus === "delivered"
                  ? 1
                  : deliveryProgress.percentage / 100
              })`,
            }}
          ></div>

          {/* Timeline Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="relative flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full text-white text-xl ${step.color} shadow-lg`}
                >
                  {step.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>
                  {index === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center justify-center">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d2d]"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
        <div className="w-full max-w-6xl p-4 sm:p-6">
          <button
            onClick={() => navigate("/user-orders")}
            className="flex items-center gap-2 text-[#ff4d2d] hover:underline mb-4"
          >
            <BiArrowBack size={20} />
            Back to Orders
          </button>
          <div className="flex flex-col items-center justify-center py-20">
            <FaBox className="text-gray-300 text-6xl mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              {error || "Order Not Found"}
            </h2>
            <p className="text-gray-500">
              Unable to load order details. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
      <div className="w-full max-w-6xl p-4 sm:p-6">
        {/* Header */}
        <button
          onClick={() => navigate("/user-orders")}
          className="flex items-center gap-2 text-[#ff4d2d] mb-4 cursor-pointer"
        >
          <BiArrowBack size={20} />
          Back to Orders
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Track Order
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Order ID: #{order._id.slice(-8).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Manual Refresh Button */}
            <button
              onClick={() => fetchOrderDetails(true)}
              className="px-4 py-2 bg-[#ff4d2d] text-white rounded-lg hover:bg-[#e64526] transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={refreshing}
            >
              <svg
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">
                {refreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>
            {/* Auto-refresh indicator */}
            <div className="text-sm text-gray-500 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="hidden sm:inline">Auto-updating • </span>
              <span>
                Last:{" "}
                {lastUpdated.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        {renderTrackingTimeline()}

        {/* Delivery Status Details */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaMotorcycle className="text-[#ff4d2d]" />
            Delivery Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Status */}
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Current Status</p>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold text-white ${getDeliveryStatusColor(
                  order.deliveryStatus,
                )}`}
              >
                {order.deliveryStatus.replace("_", " ").toUpperCase()}
              </span>
            </div>

            {/* Delivery Boy Info */}
            {order.deliveryBoy && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Delivery Partner</p>
                <div className="flex items-center gap-2">
                  <FaUser className="text-blue-600" />
                  <span className="font-medium text-gray-900">
                    {order.deliveryBoy.fullName}
                  </span>
                </div>
                {order.deliveryBoy.mobileNumber && (
                  <div className="flex items-center gap-2 mt-2">
                    <FaPhone className="text-blue-600" />
                    <span className="text-sm text-gray-700">
                      {order.deliveryBoy.mobileNumber}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* OTP Display for Customer */}
          {(order.deliveryStatus === "picked_up" ||
            order.deliveryStatus === "on_the_way" ||
            order.deliveryStatus === "reached") &&
            order.deliveryOtp && (
              <div className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-300">
                <div className="flex items-center gap-2 mb-2">
                  <FaKey className="text-green-600 text-xl" />
                  <h3 className="font-bold text-gray-900">Delivery OTP</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {order.deliveryStatus === "reached"
                    ? "Share this OTP with your delivery partner to complete the delivery:"
                    : "You will need to share this OTP when delivery partner arrives:"}
                </p>
                <div className="bg-white rounded-lg p-4 text-center border-2 border-green-400">
                  <p className="text-4xl font-bold text-green-600 tracking-widest">
                    {order.deliveryOtp}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This OTP is valid for 10 minutes
                </p>
              </div>
            )}
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-[#ff4d2d]" />
            Delivery Address
          </h2>
          <div className="space-y-2">
            <p className="text-gray-900 font-medium">
              📍 Floor: {order.deliveryAddress.floor || "N/A"}
            </p>
            <p className="text-gray-700">
              🚪 Room: {order.deliveryAddress.roomNo || "N/A"}
            </p>
            <p className="text-gray-600">
              📌 Area: {order.deliveryAddress.area || "N/A"}
            </p>
          </div>
        </div>

        {/* Shop Orders with Status */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaStore className="text-[#ff4d2d]" />
            Restaurant Status
          </h2>

          <div className="space-y-4">
            {order.shopOrder.map((shopOrder, idx) => {
              const progress = getShopStatusProgress(shopOrder.status);
              console.log(
                `🎨 Rendering shop ${shopOrder.shop.name} with status: ${shopOrder.status}`,
              );
              return (
                <div
                  key={`${shopOrder.shop._id}-${shopOrder.status}-${idx}`}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {shopOrder.shop.image && (
                      <img
                        src={shopOrder.shop.image}
                        alt={shopOrder.shop.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {shopOrder.shop.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {shopOrder.shop.city}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getShopStatusColor(
                        shopOrder.status,
                      )}`}
                    >
                      {shopOrder.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {shopOrder.shopOrderItems.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                      >
                        {item.item.image && (
                          <img
                            src={item.item.image}
                            alt={item.item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {item.item.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Order Summary
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-gray-700">
              <span>Payment Method</span>
              <span className="font-medium uppercase">
                {order.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </span>
            </div>

            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">
                Total Amount
              </span>
              <span className="text-2xl font-bold text-[#ff4d2d]">
                ৳{order.totalAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Auto-refresh Notice */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p className="flex items-center justify-center gap-2">
            <BiTimeFive />
            Order status updates automatically every 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
}

export default TrackOrder;
