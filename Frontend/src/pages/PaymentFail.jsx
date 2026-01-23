import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";

function PaymentFail() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-600 mb-6">
          Unfortunately, your payment could not be processed. Please try again
          or use a different payment method.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/cart")}
            className="bg-[#ff4d2d] text-white px-6 py-3 rounded-lg hover:bg-[#e64526] transition"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/")}
            className="border-2 border-[#ff4d2d] text-[#ff4d2d] px-6 py-3 rounded-lg hover:bg-[#fff9f6] transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentFail;
