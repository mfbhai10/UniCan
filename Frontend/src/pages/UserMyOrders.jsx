import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaShoppingBag,
  FaMapMarkerAlt,
  FaClock,
  FaMotorcycle,
} from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { BiCheckCircle } from "react-icons/bi";
import { AiOutlineEye } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";
import { serverUrl } from "../App";
import { setUserOrders, setOrderLoading } from "../redux/orderSlice";

function UserMyOrders() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userOrders, loading } = useSelector((state) => state.order);

  useEffect(() => {
    const fetchOrders = async () => {
      dispatch(setOrderLoading(true));
      try {
        const response = await fetch(`${serverUrl}/api/order/user-orders`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          dispatch(setUserOrders(data));
        } else {
          console.error("Failed to fetch orders:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        dispatch(setOrderLoading(false));
      }
    };

    fetchOrders();
  }, [dispatch]);

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
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaShoppingBag className="text-[#ff4d2d]" />
            My Orders
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d2d]"></div>
          </div>
        ) : userOrders && userOrders.length > 0 ? (
          <div className="space-y-4">
            {userOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-orange-50 to-white p-4 border-b border-orange-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-semibold text-gray-900">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaClock className="text-[#ff4d2d]" />
                        {formatDate(order.createdAt)}
                      </div>
                      <button
                        onClick={() => navigate(`/track-order/${order._id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#ff4d2d] text-white rounded-lg hover:bg-[#e64526] transition font-medium text-sm cursor-pointer"
                      >
                        <AiOutlineEye size={18} />
                        Track Order
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-4 space-y-4">
                  {/* Delivery Address */}
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <FaMapMarkerAlt className="text-[#ff4d2d] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        Delivery Address
                      </p>
                      <p className="text-gray-700 text-sm">
                        {order.deliveryAddress?.text || "No address provided"}
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

                  {/* Delivery Status */}
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <FaMotorcycle className="text-purple-600 text-xl flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm mb-1">
                        Delivery Status
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border-2 uppercase ${getDeliveryStatusColor(
                          order.deliveryStatus || "not_assigned",
                        )}`}
                      >
                        {(order.deliveryStatus || "not_assigned").replace(
                          "_",
                          " ",
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Shop Orders */}
                  {order.shopOrder?.map((shopOrder, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                        {shopOrder.shop?.image && (
                          <img
                            src={shopOrder.shop.image}
                            alt={shopOrder.shop?.name || "Shop"}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {shopOrder.shop?.name || "Unknown Shop"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {shopOrder.shop?.city || "N/A"}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border-2 uppercase flex items-center gap-1 ${getStatusColor(
                            shopOrder.status || "pending",
                          )}`}
                        >
                          {shopOrder.status === "delivered" && (
                            <BiCheckCircle size={16} />
                          )}
                          {shopOrder.status || "pending"}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {shopOrder.shopOrderItems?.map((orderItem, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            {orderItem.item?.image && (
                              <img
                                src={orderItem.item.image}
                                alt={orderItem.item?.name || "Item"}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {orderItem.item?.name || "Unknown Item"}
                              </p>
                              <p className="text-sm text-gray-600">
                                Qty: {orderItem.quantity || 0} × ৳
                                {orderItem.price || 0}
                              </p>
                            </div>
                            <p className="font-semibold text-[#ff4d2d]">
                              ৳
                              {(orderItem.price || 0) *
                                (orderItem.quantity || 0)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Shop Subtotal */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <p className="font-medium text-gray-700">
                          Shop Subtotal
                        </p>
                        <p className="font-semibold text-gray-900">
                          ৳{shopOrder.subtotal || 0}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Total Amount */}
                  <div className="flex justify-between items-center p-4 bg-[#ff4d2d] rounded-lg">
                    <p className="text-lg font-bold text-white">Total Amount</p>
                    <p className="text-2xl font-bold text-white">
                      ৳{order.totalAmount || 0}
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
            <p className="text-gray-500">
              Start ordering your favorite food items!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserMyOrders;
