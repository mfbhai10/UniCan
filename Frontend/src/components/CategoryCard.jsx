import React from "react";

function CategoryCard({ name, image, onClick, isActive }) {
  return (
    <div
      onClick={onClick}
      className={`relative w-[120px] h-[120px] md:w-[180px] md:h-[180px] bg-white rounded-2xl shadow-xl border-2 shrink-0 overflow-hidden shadow-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer ${
        isActive
          ? "border-[#ff4d2d] ring-4 ring-[#ff4d2d] ring-opacity-50 scale-105"
          : "border-gray-300 hover:border-[#ff4d2d]"
      }`}
    >
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
      />
      <div
        className={`absolute bottom-0 w-full left-0 bg-opacity-95 px-3 py-1 text-sm font-medium text-center shadow rounded-t-xl backdrop-blur ${
          isActive ? "bg-[#ff4d2d] text-white" : "bg-[#ffffff96] text-gray-900"
        }`}
      >
        {name}
      </div>
    </div>
  );
}

export default CategoryCard;
