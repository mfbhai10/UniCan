import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaBan } from "react-icons/fa";

function PaymentCancel() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <FaBan className="text-orange-500 text-6xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          You have cancelled the payment. Your order has not been placed. You
          can try again whenever you're ready.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/cart")}
            className="bg-[#ff4d2d] text-white px-6 py-3 rounded-lg hover:bg-[#e64526] transition"
          >
            Back to Cart
          </button>
          <button
            onClick={() => navigate("/")}
            className="border-2 border-[#ff4d2d] text-[#ff4d2d] px-6 py-3 rounded-lg hover:bg-[#fff9f6] transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;
