import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserOrders } from "../redux/orderSlice";

function PaymentSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Fetch updated orders
        const ordersRes = await fetch(`${serverUrl}/api/order/user-orders`, {
          method: "GET",
          credentials: "include",
        });

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          dispatch(setUserOrders(ordersData));
        }

        setLoading(false);
      } catch (error) {
        console.error("Error verifying payment:", error);
        setError("Failed to verify payment");
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#ff4d2d] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Verification Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/user-orders")}
            className="bg-[#ff4d2d] text-white px-6 py-3 rounded-lg hover:bg-[#e64526] transition"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully. Your order has been
          placed and will be prepared shortly.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/user-orders")}
            className="bg-[#ff4d2d] text-white px-6 py-3 rounded-lg hover:bg-[#e64526] transition"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate("/home")}
            className="border-2 border-[#ff4d2d] text-[#ff4d2d] px-6 py-3 rounded-lg hover:bg-[#fff9f6] transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
