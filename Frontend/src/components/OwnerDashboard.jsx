import React, { useState, useEffect } from "react";
import Nav from "./Nav.jsx";
import { useSelector } from "react-redux";
import { FaUtensils, FaChartLine, FaMoneyBillWave } from "react-icons/fa";
import { IoIosRestaurant } from "react-icons/io";
import { MdPayment } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import OwnerItemCard from "./OwnerItemCard.jsx";
import { serverUrl } from "../App.jsx";

function OwnerDashboard() {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("myShop");
  const [earningsData, setEarningsData] = useState(null);
  const [monthlyEarningsData, setMonthlyEarningsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (activeTab === "earnings" && myShopData) {
      fetchEarnings();
      const interval = setInterval(fetchEarnings, 30000); // Auto-refresh every 30 seconds
      return () => clearInterval(interval);
    } else if (activeTab === "monthlyEarnings" && myShopData) {
      fetchMonthlyEarnings();
      const interval = setInterval(fetchMonthlyEarnings, 60000); // Auto-refresh every 60 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab, myShopData]);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${serverUrl}/api/order/shop-earnings`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setEarningsData(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyEarnings = async () => {
    setLoading(true);
    try {
      console.log("📊 Fetching monthly earnings...");
      const response = await fetch(
        `${serverUrl}/api/order/monthly-shop-earnings`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      console.log("📊 Response status:", response.status);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
      <Nav />
      {!myShopData && (
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center">
              <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
              <h2 className="text-xl font-semibold">Add Your Restaurant</h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Start by adding your restaurant to manage your menu and orders
                effectively.
              </p>
              <button
                className="px-5 sm:px-6 py-2 bg-[#ff4d2d] text-white rounded-full font-medium shadow-md hover:bg-[#e04324] transition-colors duration-300"
                onClick={() => navigate("/create-edit-shop")}
              >
                Add Restaurant
              </button>
            </div>
          </div>
        </div>
      )}

      {myShopData && (
        <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 mt-8 text-center">
            <IoIosRestaurant className="text-[#ff4d2d] w-18 h-18" />
            Welcome to {myShopData.name}
          </h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-2 bg-white rounded-lg p-1 shadow-md w-full max-w-3xl">
            <button
              onClick={() => setActiveTab("myShop")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "myShop"
                  ? "bg-[#ff4d2d] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IoIosRestaurant />
              My Shop
            </button>
            <button
              onClick={() => setActiveTab("earnings")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "earnings"
                  ? "bg-[#ff4d2d] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaChartLine />
              Today
            </button>
            <button
              onClick={() => setActiveTab("monthlyEarnings")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "monthlyEarnings"
                  ? "bg-[#ff4d2d] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaMoneyBillWave />
              Monthly
            </button>
          </div>

          {/* My Shop Tab */}
          {activeTab === "myShop" && (
            <>
              <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative">
                <div
                  className="absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors cursor-pointer"
                  onClick={() => navigate("/create-edit-shop")}
                >
                  <FaPencilAlt size={20} />
                </div>
                <img
                  src={myShopData.image}
                  alt={myShopData.name}
                  className="w-full h-48 sm:h-64 object-cover"
                />
                <div className="p-4 sm:p-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    {myShopData.name}
                  </h1>
                  <p className="text-gray-500">
                    {myShopData.city}, {myShopData.state}
                  </p>
                  <p className="text-gray-500 mb-4">{myShopData.address}</p>
                </div>
              </div>

              {myShopData.items.length == 0 && (
                <div className="flex justify-center items-center p-4 sm:p-6">
                  <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex flex-col items-center text-center">
                      <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
                      <h2 className="text-xl font-semibold">
                        Add Your Food Items
                      </h2>
                      <p className="text-gray-600 mb-4 text-sm sm:text-base">
                        Start by adding food items to your menu to attract
                        customers and grow your business.
                      </p>
                      <button
                        className="px-5 sm:px-6 py-2 bg-[#ff4d2d] text-white rounded-full font-medium shadow-md hover:bg-[#e04324] transition-colors duration-300"
                        onClick={() => navigate("/add-item")}
                      >
                        Add Food
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {myShopData.items.length > 0 && (
                <div className="flex flex-col items-center gap-4 w-full max-w-3xl ">
                  {myShopData.items.map((item, index) => (
                    <OwnerItemCard key={index} data={item} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Earnings Tab */}
          {activeTab === "earnings" && (
            <div className="w-full max-w-3xl space-y-6">
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

              {loading && !earningsData ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d2d]"></div>
                </div>
              ) : earningsData ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <IoIosRestaurant className="text-4xl opacity-80" />
                        <div className="text-right">
                          <p className="text-sm opacity-90">Total Orders</p>
                          <p className="text-3xl font-bold">
                            {earningsData.totalOrders}
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
                            ৳{earningsData.totalEarnings}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <FaChartLine className="text-4xl opacity-80" />
                        <div className="text-right">
                          <p className="text-sm opacity-90">Avg Per Order</p>
                          <p className="text-3xl font-bold">
                            ৳
                            {earningsData.totalOrders > 0
                              ? Math.round(
                                  (earningsData.totalEarnings /
                                    earningsData.totalOrders) *
                                    100,
                                ) / 100
                              : 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Orders List */}
                  {earningsData.orders.length > 0 ? (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        Today's Orders
                      </h2>
                      {earningsData.orders.map((order) => (
                        <div
                          key={order.orderId}
                          className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
                        >
                          <div className="p-4 border-b border-gray-200 bg-orange-50">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-gray-600">
                                  Order ID
                                </p>
                                <p className="font-semibold text-gray-900">
                                  #{order.orderId.slice(-8).toUpperCase()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">
                                  Earnings
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                  ৳{order.shopEarnings}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Customer</p>
                                <p className="font-semibold">
                                  {order.customerName}
                                </p>
                                <p className="text-gray-500">
                                  {order.customerPhone}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Delivery Boy</p>
                                <p className="font-semibold">
                                  {order.deliveryBoyName}
                                </p>
                              </div>
                            </div>

                            <div>
                              <p className="text-gray-600 text-sm">Items:</p>
                              <ul className="list-disc list-inside text-sm">
                                {order.items.map((item, idx) => (
                                  <li key={idx} className="text-gray-700">
                                    {item.name} x{item.quantity} - ৳
                                    {item.price * item.quantity}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex justify-between items-center text-sm pt-2 border-t">
                              <div className="flex items-center gap-2">
                                <MdPayment className="text-gray-500" />
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    order.paymentMethod === "online"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {order.paymentMethod === "online"
                                    ? "Online"
                                    : "Cash on Delivery"}
                                </span>
                              </div>
                              <span className="text-gray-500">
                                {formatDate(order.deliveredAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                      <FaChartLine className="text-gray-300 text-6xl mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No Orders Today
                      </h3>
                      <p className="text-gray-500">
                        You haven't received any delivered orders yet today.
                      </p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}

          {/* Monthly Earnings Tab */}
          {activeTab === "monthlyEarnings" && (
            <div className="w-full max-w-3xl space-y-6">
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
                        <IoIosRestaurant className="text-4xl opacity-80" />
                        <div className="text-right">
                          <p className="text-sm opacity-90">Total Orders</p>
                          <p className="text-3xl font-bold">
                            {monthlyEarningsData.totalOrders}
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
                          <p className="text-sm opacity-90">Avg Per Order</p>
                          <p className="text-3xl font-bold">
                            ৳
                            {monthlyEarningsData.totalOrders > 0
                              ? Math.round(
                                  (monthlyEarningsData.totalEarnings /
                                    monthlyEarningsData.totalOrders) *
                                    100,
                                ) / 100
                              : 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Daily Earnings Chart */}
                  {Object.keys(monthlyEarningsData.dailyEarnings).length >
                    0 && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Daily Earnings Breakdown
                      </h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {Object.entries(monthlyEarningsData.dailyEarnings)
                          .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                          .map(([date, earnings]) => (
                            <div
                              key={date}
                              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                            >
                              <span className="text-gray-700 font-medium">
                                {date}
                              </span>
                              <span className="text-green-600 font-bold">
                                ৳{Math.round(earnings * 100) / 100}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Orders List */}
                  {monthlyEarningsData.orders.length > 0 ? (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        All Orders This Month
                      </h2>
                      {monthlyEarningsData.orders.map((order) => (
                        <div
                          key={order.orderId}
                          className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
                        >
                          <div className="p-4 border-b border-gray-200 bg-orange-50">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-gray-600">
                                  Order ID
                                </p>
                                <p className="font-semibold text-gray-900">
                                  #{order.orderId.slice(-8).toUpperCase()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">
                                  Earnings
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                  ৳{order.shopEarnings}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Customer</p>
                                <p className="font-semibold">
                                  {order.customerName}
                                </p>
                                <p className="text-gray-500">
                                  {order.customerPhone}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Delivery Boy</p>
                                <p className="font-semibold">
                                  {order.deliveryBoyName}
                                </p>
                              </div>
                            </div>

                            <div>
                              <p className="text-gray-600 text-sm">Items:</p>
                              <ul className="list-disc list-inside text-sm">
                                {order.items.map((item, idx) => (
                                  <li key={idx} className="text-gray-700">
                                    {item.name} x{item.quantity} - ৳
                                    {item.price * item.quantity}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex justify-between items-center text-sm pt-2 border-t">
                              <div className="flex items-center gap-2">
                                <MdPayment className="text-gray-500" />
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    order.paymentMethod === "online"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {order.paymentMethod === "online"
                                    ? "Online"
                                    : "Cash on Delivery"}
                                </span>
                              </div>
                              <span className="text-gray-500">
                                {formatDate(order.deliveredAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                      <FaChartLine className="text-gray-300 text-6xl mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No Orders This Month
                      </h3>
                      <p className="text-gray-500">
                        You haven't received any delivered orders yet this
                        month.
                      </p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
