import React, { useState } from "react";
import { FaLeaf } from "react-icons/fa";
import { FaDrumstickBite } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, setCartItems, setTotalAmount } from "../redux/userSlice";
import RatingModal from "./RatingModal";
import ReviewsListModal from "./ReviewsListModal";
import { serverUrl } from "../App";

function FoodCard({ data }) {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [itemRating, setItemRating] = useState(data.rating);
  const [addingToCart, setAddingToCart] = useState(false);
  const { cartItems } = useSelector((state) => state.user);
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="text-yellow-500 text-lg" />
        ) : (
          <FaRegStar key={i} className="text-yellow-500 text-lg" />
        ),
      );
    }
    return stars;
  };

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
    }
  };

  const handleRatingSubmit = (newRating) => {
    setItemRating(newRating);
  };

  const handleAddToCart = async () => {
    if (quantity <= 0) return;

    setAddingToCart(true);
    try {
      const response = await fetch(`${serverUrl}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemId: data._id, quantity }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.cart) {
          // Transform backend cart to frontend format
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
          setQuantity(0); // Reset quantity after adding
        }
      } else {
        alert("Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="w-[250px] rounded-2xl border-2 border-[#ff4d2d] bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative w-full h-[170px] flex justify-center items-center bg-white">
        <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow">
          {data.foodType === "Veg" ? (
            <FaLeaf className="text-green-600 text-lg" />
          ) : (
            <FaDrumstickBite className="text-red-600 text-lg" />
          )}
        </div>
        <img
          src={data.image}
          alt={data.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h2 className="text-lg font-semibold text-gray-900">{data.name}</h2>
        <div className="mt-2 mb-4">
          <div
            className="flex items-center cursor-pointer hover:scale-105 transition-transform w-fit"
            onClick={() => setShowRatingModal(true)}
            title="Click to rate this item"
          >
            <div className="flex items-center gap-1 mt-1">
              {renderStars(itemRating?.average || 0)}
            </div>
            <span className="text-sm text-gray-500 ml-2">
              ({itemRating?.count || 0})
            </span>
          </div>
          {itemRating?.count > 0 && (
            <button
              onClick={() => setShowReviewsModal(true)}
              className="text-xs text-[#ff4d2d] hover:underline mt-1 font-medium"
            >
              View all reviews
            </button>
          )}
        </div>

        <div className="mt-auto flex justify-between items-center">
          <span className="text-xl font-bold text-[#ff4d2d]">
            ৳ {data.price}
          </span>

          <div className="flex items-center border rounded-full overflow-hidden shadow-sm">
            <button
              className="px-2 py-1 hover:bg-[#ffe6e0] transition  cursor-pointer"
              onClick={handleDecrease}
            >
              <FaMinus size={12} />
            </button>
            <span>{quantity}</span>
            <button
              className="px-2 py-1 hover:bg-[#ffe6e0] transition  cursor-pointer"
              onClick={handleIncrease}
            >
              <FaPlus size={12} />
            </button>
            <button
              className={`${cartItems.some((i) => i.id == data._id) ? "bg-gray-800" : "bg-[#ff4d2d]"} text-white px-3 py-2 transition-colors cursor-pointer disabled:opacity-50`}
              onClick={handleAddToCart}
              disabled={addingToCart || quantity <= 0}
            >
              <FaShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          item={{ ...data, rating: itemRating }}
          onClose={() => setShowRatingModal(false)}
          onRatingSubmit={handleRatingSubmit}
        />
      )}

      {/* Reviews List Modal */}
      {showReviewsModal && (
        <ReviewsListModal
          item={{ ...data, rating: itemRating }}
          onClose={() => setShowReviewsModal(false)}
        />
      )}
    </div>
  );
}

export default FoodCard;
