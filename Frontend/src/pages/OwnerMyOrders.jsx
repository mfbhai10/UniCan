import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaShoppingBag,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { MdPayment, MdRestaurant } from "react-icons/md";
import { BiTimeFive, BiArrowBack } from "react-icons/bi";
import { serverUrl } from "../App";
import { setOwnerOrders } from "../redux/orderSlice";

function OwnerMyOrders() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { ownerOrders, loading } = useSelector((state) => state.order);
  const { myShopData } = useSelector((state) => state.owner);
  const [updatingStatus, setUpdatingStatus] = useState(null);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "preparing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "ready":
        return "bg-green-100 text-green-800 border-green-300";
      case "delivered":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const response = await fetch(
        `${serverUrl}/api/order/update-status/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        // Refresh owner orders
        const ordersRes = await fetch(`${serverUrl}/api/order/owner-orders`, {
          method: "GET",
          credentials: "include",
        });

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          dispatch(setOwnerOrders(ordersData));
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
      <div className="w-full max-w-6xl p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-[#ff4d2d] hover:text-[#e64526] transition cursor-pointer"
          >
            <BiArrowBack size={24} />
          </button>
          <div className="flex items-center gap-3">
            <MdRestaurant className="text-[#ff4d2d] text-3xl" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Orders for {myShopData?.name}
              </h1>
              <p className="text-gray-600 text-sm">
                Manage and track your restaurant orders
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d2d]"></div>
          </div>
        ) : ownerOrders && ownerOrders.length > 0 ? (
          <div className="space-y-4">
            {ownerOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-orange-50 to-white p-4 border-b border-orange-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BiTimeFive className="text-[#ff4d2d] text-lg" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-4 space-y-4">
                  {/* Customer Information */}
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                      <FaUser className="text-blue-600" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-500" />
                        <span className="text-gray-700">
                          {order.user?.fullName || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-500" />
                        <span className="text-gray-700">
                          {order.user?.email || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-500" />
                        <span className="text-gray-700">
                          {order.user?.mobileNumber || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <FaMapMarkerAlt className="text-[#ff4d2d] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        Delivery Address
                      </p>
                      <p className="text-gray-700 text-sm">
                        {order.deliveryAddress.text}
                      </p>
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

                  {/* Order Status Update */}
                  {order.shopOrder.map((shopOrder, idx) => (
                    <div
                      key={idx}
                      className="bg-purple-50 rounded-lg p-4 space-y-3"
                    >
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Order Status
                      </h3>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold border-2 uppercase ${getStatusColor(
                            shopOrder.status || "pending",
                          )}`}
                        >
                          {shopOrder.status || "pending"}
                        </span>
                        <select
                          value={shopOrder.status || "pending"}
                          onChange={(e) =>
                            handleStatusUpdate(order._id, e.target.value)
                          }
                          disabled={
                            updatingStatus === order._id ||
                            shopOrder.status === "delivered" ||
                            shopOrder.status === "cancelled"
                          }
                          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready for Pickup</option>
                          <option value="delivered">Delivered</option>
                          {shopOrder.status !== "delivered" && (
                            <option value="cancelled">Cancelled</option>
                          )}
                        </select>
                      </div>
                      {updatingStatus === order._id && (
                        <p className="text-sm text-gray-600 animate-pulse">
                          Updating status...
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Ordered Items */}
                  <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-200">
                      <FaShoppingBag className="text-[#ff4d2d]" />
                      Ordered Items
                    </h3>

                    <div className="space-y-2">
                      {order.shopOrder.map((shopOrder, idx) =>
                        shopOrder.shopOrderItems.map((orderItem, itemIdx) => (
                          <div
                            key={`${idx}-${itemIdx}`}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            {orderItem.item.image && (
                              <img
                                src={orderItem.item.image}
                                alt={orderItem.item.name}
                                className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {orderItem.item.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Category: {orderItem.item.category}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                Quantity: {orderItem.quantity} × ৳
                                {orderItem.price}
                              </p>
                            </div>
                            <p className="font-bold text-[#ff4d2d] text-lg">
                              ৳{orderItem.price * orderItem.quantity}
                            </p>
                          </div>
                        )),
                      )}
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] rounded-lg">
                    <p className="text-lg font-bold text-white">Order Total</p>
                    <p className="text-2xl font-bold text-white">
                      ৳{order.totalAmount}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <FaShoppingBag className="text-gray-300 text-6xl mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              No Orders Yet
            </h2>
            <p className="text-gray-500 text-center">
              {myShopData
                ? "You haven't received any orders yet. Keep your menu updated!"
                : "Please create a shop first to receive orders."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerMyOrders;
