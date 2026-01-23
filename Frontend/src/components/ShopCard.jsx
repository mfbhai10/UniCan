import React from "react";
import { FaStore, FaMapMarkerAlt } from "react-icons/fa";
import { MdRestaurant } from "react-icons/md";

function ShopCard({ shop, onClick, isActive }) {
  return (
    <div
      onClick={onClick}
      className={`relative w-[200px] h-[240px] md:w-[240px] md:h-[280px] bg-white rounded-2xl shadow-xl shrink-0 overflow-hidden transition-all duration-300 cursor-pointer ${
        isActive
          ? "border-4 border-[#ff4d2d] shadow-2xl transform scale-[1.02]"
          : "border-2 border-gray-200 hover:border-orange-300 hover:shadow-2xl hover:scale-[1.01]"
      }`}
    >
      {/* Shop Image */}
      <div className="relative w-full h-[140px] md:h-[160px] overflow-hidden">
        <img
          src={shop.image}
          alt={shop.name}
          loading="lazy"
          className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
        />
        {/* Active Badge */}
        {isActive && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
            <FaStore className="text-sm" />
            Selected
          </div>
        )}
      </div>

      {/* Shop Details */}
      <div className="p-4 flex flex-col gap-2">
        {/* Shop Name */}
        <div className="flex items-start gap-2">
          <MdRestaurant
            className={`text-xl flex-shrink-0 mt-0.5 transition-colors duration-200 ${
              isActive ? "text-[#ff4d2d]" : "text-gray-600"
            }`}
          />
          <h3
            className={`font-bold text-base line-clamp-2 transition-colors duration-200 ${
              isActive ? "text-[#ff4d2d]" : "text-gray-900"
            }`}
          >
            {shop.name}
          </h3>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2">
          <FaMapMarkerAlt className="text-gray-400 text-sm flex-shrink-0 mt-1" />
          <p className="text-xs text-gray-600 line-clamp-2">{shop.address}</p>
        </div>

        {/* City Badge */}
        <div className="flex items-center justify-between mt-auto">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium transition-colors duration-200 ${
              isActive
                ? "bg-orange-100 text-[#ff4d2d]"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {shop.city}
          </span>
          {shop.items && (
            <span
              className={`text-xs transition-colors duration-200 ${
                isActive ? "text-[#ff4d2d] font-semibold" : "text-gray-500"
              }`}
            >
              {shop.items.length} items
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShopCard;
