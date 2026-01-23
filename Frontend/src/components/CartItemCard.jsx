import React, { useState } from "react";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import {
  removeCartItem,
  updateQuantity,
  setCartItems,
  setTotalAmount,
} from "../redux/userSlice";
import { serverUrl } from "../App";

function CartItemCard({ data }) {
  const dispatch = useDispatch();
  const [updating, setUpdating] = useState(false);

  const updateCartOnServer = async (itemId, newQuantity) => {
    setUpdating(true);
    try {
      const response = await fetch(`${serverUrl}/api/cart/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.cart) {
          const cartItems = result.cart.items.map((item) => ({
            id: item.item._id,
            name: item.item.name,
            image: item.item.image,
            price: item.priceAtAddition,
            quantity: item.quantity,
            shop: item.shop,
            category: item.item.category,
            foodType: item.item.foodType,
          }));

          dispatch(setCartItems(cartItems));
          dispatch(setTotalAmount(result.cart.totalAmount));
        }
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    } finally {
      setUpdating(false);
    }
  };

  const removeFromCart = async (itemId) => {
    setUpdating(true);
    try {
      const response = await fetch(`${serverUrl}/api/cart/remove/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.cart) {
          const cartItems = result.cart.items.map((item) => ({
            id: item.item._id,
            name: item.item.name,
            image: item.item.image,
            price: item.priceAtAddition,
            quantity: item.quantity,
            shop: item.shop,
            shopId: item.shop?._id,
            ownerId: item.shop?.owner,
            category: item.item.category,
            foodType: item.item.foodType,
          }));

          dispatch(setCartItems(cartItems));
          dispatch(setTotalAmount(result.cart.totalAmount));
        }
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleIncrease = (id, currentQuantity) => {
    updateCartOnServer(id, currentQuantity + 1);
  };

  const handleDecrease = (id, currentQuantity) => {
    if (currentQuantity > 1) {
      updateCartOnServer(id, currentQuantity - 1);
    }
  };
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow border">
      <div className="flex items-center gap-4">
        <img
          src={data.image}
          alt={data.name}
          className="w-20 h-20 object-cover rounded-lg border"
        />
        <div>
          <h1 className="font-medium text-gray-800">{data.name}</h1>
          <p className="text-sm text-gray-500">
            ৳{data.price} × {data.quantity}
          </p>
          <p className="font-bold text-gray-900">
            ৳{data.price * data.quantity}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-2 bg-gray-100 rounded-full hover:bg-red-200 gray cursor-pointer disabled:opacity-50"
          onClick={() => handleDecrease(data.id, data.quantity)}
          disabled={updating}
        >
          <FaMinus size={12} />
        </button>
        <span>{data.quantity}</span>
        <button
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 gray cursor-pointer disabled:opacity-50"
          onClick={() => handleIncrease(data.id, data.quantity)}
          disabled={updating}
        >
          <FaPlus size={12} />
        </button>
        <button
          className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition disabled:opacity-50"
          onClick={() => removeFromCart(data.id)}
          disabled={updating}
        >
          <FaTrashAlt size={18} />
        </button>
      </div>
    </div>
  );
}

export default CartItemCard;
