import React, { useState } from "react";
import { FaStar, FaRegStar, FaTimes } from "react-icons/fa";
import { serverUrl } from "../App";

function RatingModal({ item, onClose, onRatingSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${serverUrl}/api/rating/rate-item/${item._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ rating, review }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert("Rating submitted successfully!");
        onRatingSubmit(data.itemRating);
        onClose();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(i)}
          className="transition-transform hover:scale-110"
        >
          {i <= (hoverRating || rating) ? (
            <FaStar className="text-yellow-500 text-4xl" />
          ) : (
            <FaRegStar className="text-gray-300 text-4xl" />
          )}
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
        >
          <FaTimes size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Rate this item
          </h2>
          <div className="flex items-center gap-3">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-600">
                Current: {item.rating?.average?.toFixed(1) || 0} ⭐ (
                {item.rating?.count || 0} ratings)
              </p>
            </div>
          </div>
        </div>

        {/* Star Rating */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Your Rating
          </p>
          <div className="flex items-center justify-center gap-2 mb-2">
            {renderStars()}
          </div>
          <p className="text-center text-sm text-gray-600">
            {rating > 0 ? (
              <span className="font-semibold text-[#ff4d2d]">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </span>
            ) : (
              "Click to rate"
            )}
          </p>
        </div>

        {/* Review Text Area */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Review (Optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with this item..."
            maxLength={500}
            disabled={loading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={4}
          />
          <p className="text-xs text-gray-500 text-right mt-1">
            {review.length}/500 characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="flex-1 px-6 py-3 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e64526] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RatingModal;
