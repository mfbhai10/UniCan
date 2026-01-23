import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import { serverUrl } from "../App";
import {
  FaMotorcycle,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaShoppingBag,
  FaCheckCircle,
  FaKey,
  FaChartLine,
  FaMoneyBillWave,
} from "react-icons/fa";
import { MdPayment, MdDeliveryDining } from "react-icons/md";
import { BiTimeFive } from "react-icons/bi";

function DeliveryBoy() {
  const [activeTab, setActiveTab] = useState("myOrders"); // Changed default to myOrders
  const [myOrders, setMyOrders] = useState([]);
  const [todayData, setTodayData] = useState(null);
  const [monthlyEarningsData, setMonthlyEarningsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedOrderForOtp, setSelectedOrderForOtp] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Auto-refresh every 10 seconds
    return () => clearInterval(interval);
  }, [activeTab]);

  // Timer countdown for assigned orders
  useEffect(() => {
    const timers = {};
    myOrders.forEach((order) => {
      if (order.deliveryStatus === "assigned" && order.assignmentExpiry) {
        const updateTimer = () => {
          const now = new Date().getTime();
          const expiry = new Date(order.assignmentExpiry).getTime();
          const remaining = Math.max(0, Math.floor((expiry - now) / 1000));

          setTimeRemaining((prev) => ({
            ...prev,
            [order._id]: remaining,
          }));

          if (remaining <= 0) {
            clearInterval(timers[order._id]);
            fetchOrders(); // Refresh to get updated assignment
          }
        };

        updateTimer(); // Initial update
        timers[order._id] = setInterval(updateTimer, 1000);
      }
    });

    return () => {
      Object.values(timers).forEach((timer) => clearInterval(timer));
    };
  }, [myOrders]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (activeTab === "myOrders") {
        const response = await fetch(
          `${serverUrl}/api/order/delivery-boy-orders`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        if (response.ok) {
          const data = await response.json();
          setMyOrders(data);
          setLastUpdated(new Date());
        }
      } else if (activeTab === "today") {
        const response = await fetch(
          `${serverUrl}/api/order/today-deliveries`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        if (response.ok) {
          const data = await response.json();
          setTodayData(data);
          setLastUpdated(new Date());
        }
      } else if (activeTab === "monthlyEarnings") {
        fetchMonthlyEarnings();
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyEarnings = async () => {
    setLoading(true);
    try {
      console.log("📊 Fetching delivery boy monthly earnings...");
      const response = await fetch(
        `${serverUrl}/api/order/delivery-boy-monthly-earnings`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      if (response.ok) {
        const data = await response.json();
        console.log("📊 Monthly earnings data:", data);
        setMonthlyEarningsData(data);
        setLastUpdated(new Date());
      } else {
        const errorText = await response.text();
        console.error("📊 Error response:", errorText);
      }
    } catch (error) {
      console.error("📊 Error fetching monthly earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    setUpdatingOrder(orderId);
    try {
      const response = await fetch(
        `${serverUrl}/api/order/confirm-accept/${orderId}`,
        {
          method: "PUT",
          credentials: "include",
        },
      );

      if (response.ok) {
        alert("Order accepted successfully!");
        fetchOrders();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to accept order");
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      alert("Failed to accept order. Please try again.");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (
      !confirm(
        "Are you sure you want to reject this order? It will be assigned to another delivery boy.",
      )
    ) {
      return;
    }

    setUpdatingOrder(orderId);
    try {
      const response = await fetch(
        `${serverUrl}/api/order/reject-order/${orderId}`,
        {
          method: "PUT",
          credentials: "include",
        },
      );

      if (response.ok) {
        alert("Order rejected. It will be assigned to another delivery boy.");
        fetchOrders();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to reject order");
      }
    } catch (error) {
      console.error("Error rejecting order:", error);
      alert("Failed to reject order. Please try again.");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleUpdateDeliveryStatus = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      const response = await fetch(
        `${serverUrl}/api/order/update-delivery-status/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ deliveryStatus: newStatus }),
        },
      );

      if (response.ok) {
        alert("Delivery status updated successfully!");
        fetchOrders();

        // Auto-generate OTP when status changes to 'reached'
        if (newStatus === "reached") {
          handleGenerateOtp(orderId);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to update delivery status");
      }
    } catch (error) {
      console.error("Error updating delivery status:", error);
      alert("Failed to update delivery status. Please try again.");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleGenerateOtp = async (orderId) => {
    setOtpLoading(true);
    try {
      const response = await fetch(
        `${serverUrl}/api/order/generate-otp/${orderId}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (response.ok) {
        alert("OTP sent to customer's email successfully!");
        setSelectedOrderForOtp(orderId);
        setShowOtpModal(true);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to generate OTP");
      }
    } catch (error) {
      console.error("Error generating OTP:", error);
      alert("Failed to generate OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch(
        `${serverUrl}/api/order/verify-otp/${selectedOrderForOtp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ otp: otpInput }),
        },
      );

      if (response.ok) {
        alert("Order delivered successfully!");
        setShowOtpModal(false);
        setOtpInput("");
        setSelectedOrderForOtp(null);
        fetchOrders();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Failed to verify OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtpInput("");
    setSelectedOrderForOtp(null);
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

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case "not_assigned":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "picked_up":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "on_the_way":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "reached":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const renderOrderCard = (order) => {
    const isAssignedPending =
      order.deliveryStatus === "assigned" && order.assignmentExpiry;
    const remaining = timeRemaining[order._id] || 0;

    return (
      <div
        key={order._id}
        className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        {/* Auto-Assignment Alert Banner */}
        {isAssignedPending && (
          <div
            className={`p-4 ${remaining <= 10 ? "bg-red-100 border-red-300" : "bg-yellow-100 border-yellow-300"} border-b-2`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BiTimeFive
                  className={`text-2xl ${remaining <= 10 ? "text-red-600 animate-pulse" : "text-yellow-600"}`}
                />
                <div>
                  <p
                    className={`font-bold ${remaining <= 10 ? "text-red-800" : "text-yellow-800"}`}
                  >
                    ⚠️ NEW ORDER AUTO-ASSIGNED TO YOU!
                  </p>
                  <p
                    className={`text-sm ${remaining <= 10 ? "text-red-700" : "text-yellow-700"}`}
                  >
                    Please accept or reject within {remaining} seconds
                  </p>
                </div>
              </div>
              <div
                className={`text-3xl font-bold ${remaining <= 10 ? "text-red-600 animate-pulse" : "text-yellow-600"}`}
              >
                {remaining}s
              </div>
            </div>
          </div>
        )}
        {/* Order Header */}
        <div className="bg-gradient-to-r from-orange-50 to-white p-4 border-b border-orange-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-semibold text-gray-900 text-lg">
                #{order._id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BiTimeFive className="text-[#ff4d2d] text-lg" />
              <span className="text-sm text-gray-600">
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="p-4 space-y-4">
          {/* Customer Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <FaUser className="text-blue-600" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <FaUser className="text-gray-500" />
                <span className="text-gray-700">{order.user.fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaPhone className="text-gray-500" />
                <span className="text-gray-700">{order.user.mobileNumber}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
            <FaMapMarkerAlt className="text-[#ff4d2d] mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">
                Delivery Address
              </p>
              <div className="space-y-1 mt-1">
                <p className="text-gray-900 font-medium text-sm">
                  📍 {order.deliveryAddress.floor || "N/A"}
                </p>
                <p className="text-gray-700 text-sm">
                  🚪 Room: {order.deliveryAddress.roomNo || "N/A"}
                </p>
                <p className="text-gray-600 text-sm">
                  📌 {order.deliveryAddress.area || "N/A"}
                </p>
                {order.deliveryAddress.floorNumber !== undefined && (
                  <p className="text-xs text-gray-500 mt-2 bg-white px-2 py-1 rounded inline-block">
                    Distance from Canteen:{" "}
                    {Math.abs(order.deliveryAddress.floorNumber)} floor
                    {Math.abs(order.deliveryAddress.floorNumber) !== 1
                      ? "s"
                      : ""}
                    {order.deliveryAddress.floorNumber < 0
                      ? " (Below)"
                      : order.deliveryAddress.floorNumber > 0
                        ? " (Above)"
                        : " (Same Floor)"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <MdPayment className="text-green-600 text-xl flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Payment Method
              </p>
              <p className="text-gray-700 text-sm uppercase">
                {order.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </p>
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <FaShoppingBag className="text-[#ff4d2d]" />
              Order Items (
              {order.shopOrder.reduce(
                (acc, so) => acc + so.shopOrderItems.length,
                0,
              )}{" "}
              items)
            </h3>
            {order.shopOrder.map((shopOrder, idx) => (
              <div key={idx} className="mb-3 last:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  {shopOrder.shop.image && (
                    <img
                      src={shopOrder.shop.image}
                      alt={shopOrder.shop.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  )}
                  <p className="font-medium text-gray-900">
                    {shopOrder.shop.name}
                  </p>
                </div>
                <div className="space-y-1 text-sm text-gray-600 ml-10">
                  {shopOrder.shopOrderItems.map((item, itemIdx) => (
                    <div key={itemIdx}>
                      {item.item.name} × {item.quantity}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Total Amount */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] rounded-lg">
            <p className="text-lg font-bold text-white">Total Amount</p>
            <p className="text-2xl font-bold text-white">
              ৳{order.totalAmount}
            </p>
          </div>

          {/* Delivery Status / Actions */}
          {isAssignedPending ? (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-300">
                <p className="text-sm font-semibold text-gray-800 mb-3 text-center">
                  🔔 This order has been automatically assigned to you!
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAcceptOrder(order._id)}
                    disabled={updatingOrder === order._id}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FaCheckCircle />
                    {updatingOrder === order._id ? "Accepting..." : "ACCEPT"}
                  </button>
                  <button
                    onClick={() => handleRejectOrder(order._id)}
                    disabled={updatingOrder === order._id}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingOrder === order._id ? "Rejecting..." : "REJECT"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <MdDeliveryDining className="text-purple-600" />
                  Delivery Status
                </h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold border-2 uppercase ${getDeliveryStatusColor(
                      order.deliveryStatus,
                    )}`}
                  >
                    {order.deliveryStatus.replace("_", " ")}
                  </span>
                  {order.deliveryStatus !== "delivered" && (
                    <select
                      value={order.deliveryStatus}
                      onChange={(e) =>
                        handleUpdateDeliveryStatus(order._id, e.target.value)
                      }
                      disabled={
                        updatingOrder === order._id ||
                        order.deliveryStatus === "delivered"
                      }
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="assigned">Assigned</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="on_the_way">On The Way</option>
                      <option value="reached">Reached</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  )}
                </div>
                {updatingOrder === order._id && (
                  <p className="text-sm text-gray-600 animate-pulse">
                    Updating status...
                  </p>
                )}
              </div>

              {/* OTP Verification Section */}
              {order.deliveryStatus === "reached" && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200">
                  <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-3">
                    <FaKey className="text-green-600" />
                    Delivery Verification
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    OTP has been sent to customer. Click "Verify OTP" and ask
                    customer for the code.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedOrderForOtp(order._id);
                        setShowOtpModal(true);
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <FaKey />
                      Verify OTP
                    </button>
                    <button
                      onClick={() => handleGenerateOtp(order._id)}
                      disabled={otpLoading}
                      className="px-4 py-3 bg-white border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {otpLoading ? "Sending..." : "Resend"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
      <Nav />
      <div className="w-full max-w-6xl p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <FaMotorcycle className="text-[#ff4d2d] text-3xl" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Delivery Dashboard
              </h1>
              <p className="text-gray-600 text-sm">
                Manage your deliveries efficiently
              </p>
            </div>
          </div>
          {/* Auto-refresh indicator */}
          <div className="text-sm text-gray-500 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>
              Auto-updating • Last:{" "}
              {lastUpdated.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow-md flex-wrap">
          <button
            onClick={() => setActiveTab("myOrders")}
            className={`flex-1 min-w-fit py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === "myOrders"
                ? "bg-[#ff4d2d] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            My Deliveries
          </button>
          <button
            onClick={() => setActiveTab("today")}
            className={`flex-1 min-w-fit py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === "today"
                ? "bg-[#ff4d2d] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Today's Earnings
          </button>
          <button
            onClick={() => setActiveTab("monthlyEarnings")}
            className={`flex-1 min-w-fit py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === "monthlyEarnings"
                ? "bg-[#ff4d2d] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Monthly Earnings
          </button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d2d]"></div>
          </div>
        ) : activeTab === "myOrders" ? (
          myOrders.length > 0 ? (
            <div className="space-y-4">
              {myOrders.map((order) => renderOrderCard(order))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <MdDeliveryDining className="text-gray-300 text-6xl mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                No Active Deliveries
              </h2>
              <p className="text-gray-500 text-center">
                Orders will be automatically assigned to you when available!
              </p>
            </div>
          )
        ) : activeTab === "today" && todayData ? (
          <div className="space-y-6">
            {/* Earnings Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Deliveries */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FaMotorcycle className="text-4xl opacity-80" />
                  <div className="text-right">
                    <p className="text-sm opacity-90">Total Deliveries</p>
                    <p className="text-3xl font-bold">
                      {todayData.totalDeliveries}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Earnings */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <MdPayment className="text-4xl opacity-80" />
                  <div className="text-right">
                    <p className="text-sm opacity-90">Total Earnings</p>
                    <p className="text-3xl font-bold">
                      ৳{todayData.totalEarnings}
                    </p>
                  </div>
                </div>
              </div>

              {/* Average Per Delivery */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <FaCheckCircle className="text-4xl opacity-80" />
                  <div className="text-right">
                    <p className="text-sm opacity-90">Avg Per Delivery</p>
                    <p className="text-3xl font-bold">
                      ৳
                      {todayData.totalDeliveries > 0
                        ? Math.round(
                            (todayData.totalEarnings /
                              todayData.totalDeliveries) *
                              100,
                          ) / 100
                        : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Deliveries List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BiTimeFive className="text-[#ff4d2d]" />
                Today's Deliveries
              </h3>
              {todayData.deliveries.length > 0 ? (
                <div className="space-y-4">
                  {todayData.deliveries.map((delivery, index) => (
                    <div
                      key={delivery.orderId}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            #{index + 1} - {delivery.customerName}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <FaPhone className="text-xs" />
                            {delivery.customerPhone}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Delivery Fee</p>
                          <p className="text-lg font-bold text-green-600">
                            ৳{delivery.deliveryFee.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 mb-2">
                        <FaMapMarkerAlt className="text-[#ff4d2d] mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          {delivery.deliveryAddress}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t">
                        <div>
                          <span className="font-medium">
                            {delivery.itemCount}
                          </span>{" "}
                          items from{" "}
                          <span className="font-medium">
                            {delivery.shops.join(", ")}
                          </span>
                        </div>
                        <div className="text-xs">
                          {new Date(delivery.deliveredAt).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        Order Total: ৳{delivery.totalAmount}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p>No deliveries completed today yet.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          activeTab === "today" && (
            <div className="flex flex-col items-center justify-center py-20">
              <BiTimeFive className="text-gray-300 text-6xl mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                No Deliveries Today
              </h2>
              <p className="text-gray-500 text-center">
                Complete deliveries to see your earnings here!
              </p>
            </div>
          )
        )}

        {/* Monthly Earnings Tab */}
        {activeTab === "monthlyEarnings" && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            {/* Auto-refresh indicator */}
            <div className="text-sm text-gray-500 flex items-center justify-end gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>
                Auto-updating • Last:{" "}
                {lastUpdated.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>

            {loading && !monthlyEarningsData ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d2d]"></div>
              </div>
            ) : monthlyEarningsData ? (
              <>
                {/* Month Header */}
                <div className="bg-white rounded-xl shadow-md p-4 text-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {monthlyEarningsData.month}
                  </h2>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <FaMotorcycle className="text-4xl opacity-80" />
                      <div className="text-right">
                        <p className="text-sm opacity-90">Total Deliveries</p>
                        <p className="text-3xl font-bold">
                          {monthlyEarningsData.totalDeliveries}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <FaMoneyBillWave className="text-4xl opacity-80" />
                      <div className="text-right">
                        <p className="text-sm opacity-90">Total Earnings</p>
                        <p className="text-3xl font-bold">
                          ৳{monthlyEarningsData.totalEarnings}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <FaChartLine className="text-4xl opacity-80" />
                      <div className="text-right">
                        <p className="text-sm opacity-90">Avg Per Delivery</p>
                        <p className="text-3xl font-bold">
                          ৳
                          {monthlyEarningsData.totalDeliveries > 0
                            ? Math.round(
                                (monthlyEarningsData.totalEarnings /
                                  monthlyEarningsData.totalDeliveries) *
                                  100,
                              ) / 100
                            : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Breakdown */}
                {monthlyEarningsData.dailyBreakdown &&
                monthlyEarningsData.dailyBreakdown.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FaChartLine className="text-[#ff4d2d]" />
                      Daily Breakdown
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {monthlyEarningsData.dailyBreakdown.map((day, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {day.date}
                            </p>
                            <p className="text-sm text-gray-600">
                              {day.deliveries} deliveries
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              ৳{day.earnings}
                            </p>
                            <p className="text-xs text-gray-500">
                              Avg: ৳
                              {day.deliveries > 0
                                ? (day.earnings / day.deliveries).toFixed(2)
                                : 0}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl">
                <FaMotorcycle className="text-gray-300 text-6xl mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">
                  No Monthly Data
                </h2>
                <p className="text-gray-500 text-center">
                  Complete deliveries to see your monthly earnings!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaKey className="text-green-600" />
                Verify OTP
              </h2>
              <button
                onClick={closeOtpModal}
                disabled={otpLoading}
                className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> OTP has been sent to customer's email.
                Ask the customer for the 6-digit OTP to complete delivery.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength="6"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                disabled={otpLoading}
                className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed tracking-widest"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeOtpModal}
                disabled={otpLoading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otpInput.length !== 6}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpLoading ? "Verifying..." : "Verify & Complete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryBoy;
