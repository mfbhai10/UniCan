import React, { useState, useEffect } from "react";
import { FaStar, FaTimes } from "react-icons/fa";
import { serverUrl } from "../App";

function ReviewsListModal({ item, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [item._id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${serverUrl}/api/rating/item-ratings/${item._id}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        setError("Failed to load reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`${
            i <= rating ? "text-yellow-500" : "text-gray-300"
          } text-sm`}
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} months ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col relative">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimes size={24} />
          </button>

          <div className="flex items-center gap-4">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  {renderStars(Math.round(item.rating?.average || 0))}
                </div>
                <span className="text-sm text-gray-600">
                  {item.rating?.average?.toFixed(1) || 0} (
                  {item.rating?.count || 0} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d2d]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 font-semibold">{error}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No reviews yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Be the first to review this item!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.user?.fullName || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.review && (
                    <p className="text-gray-700 text-sm mt-2 leading-relaxed">
                      {review.review}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#ff4d2d] text-white rounded-lg font-semibold hover:bg-[#e63e1e] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewsListModal;
