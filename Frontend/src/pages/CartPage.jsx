import React from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CartItemCard from "../components/CartItemCard";

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, totalAmount } = useSelector((state) => state.user);
  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center p-6">
      <div className="w-full max-w-[800px]">
        <div className="flex items-center gap-[20px] mb-6 ">
          <div
            className=" z-[10]  cursor-pointer"
            onClick={() => navigate("/home")}
          >
            <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
          </div>
          <h1 className="text-2xl font-bold text-start">Your Cart</h1>
        </div>
        {cartItems?.length == 0 ? (
          <div className="text-center text-gray-500 mt-20">
            Your cart is empty.
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems?.map((item, index) => (
                <CartItemCard key={index} data={item} />
              ))}
            </div>

            <div className="mt-6 p-4 bg-white rounded-xl shadow border flex items-center justify-between">
              <h1 className="font-bold text-gray-800">Total Amount</h1>
              <span className="text-xl font-bold text-[#ff4d2d]">
                ৳ {totalAmount}
              </span>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-[#e64526] transition cursor-pointer"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartPage;
