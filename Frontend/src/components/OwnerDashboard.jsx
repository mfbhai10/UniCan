import React from "react";
import Nav from "./Nav.jsx";
import { useSelector } from "react-redux";
import { FaUtensils } from "react-icons/fa";
import { IoIosRestaurant } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import OwnerItemCard from "./ownerItemCard.jsx";

function OwnerDashboard() {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();
  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
      <Nav />
      {!myShopData && (
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center">
              <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
              <h2 className="text-xl font-semibold">Add Your Restaurant</h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Start by adding your restaurant to manage your menu and orders
                effectively.
              </p>
              <button
                className="px-5 sm:px-6 py-2 bg-[#ff4d2d] text-white rounded-full font-medium shadow-md hover:bg-[#e04324] transition-colors duration-300"
                onClick={() => navigate("/create-edit-shop")}
              >
                Add Restaurant
              </button>
            </div>
          </div>
        </div>
      )}

      {myShopData && (
        <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 mt-8 text-center">
            <IoIosRestaurant className="text-[#ff4d2d] w-18 h-18" />
            Welcome to {myShopData.name}
          </h1>

          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative">
            <div
              className="absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors cursor-pointer"
              onClick={() => navigate("/create-edit-shop")}
            >
              <FaPencilAlt size={20} />
            </div>
            <img
              src={myShopData.image}
              alt={myShopData.name}
              className="w-full h-48 sm:h-64 object-cover"
            />
            <div className="p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {myShopData.name}
              </h1>
              <p className="text-gray-500">
                {myShopData.city}, {myShopData.state}
              </p>
              <p className="text-gray-500 mb-4">{myShopData.address}</p>
            </div>
          </div>

          {myShopData.items.length == 0 && (
            <div className="flex justify-center items-center p-4 sm:p-6">
              <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col items-center text-center">
                  <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
                  <h2 className="text-xl font-semibold">Add Your Food Items</h2>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Start by adding food items to your menu to attract customers
                    and grow your business.
                  </p>
                  <button
                    className="px-5 sm:px-6 py-2 bg-[#ff4d2d] text-white rounded-full font-medium shadow-md hover:bg-[#e04324] transition-colors duration-300"
                    onClick={() => navigate("/add-item")}
                  >
                    Add Food
                  </button>
                </div>
              </div>
            </div>
          )}

          {myShopData.items.length > 0 && (
            <div className="flex flex-col items-center gap-4 w-full max-w-3xl ">
              {myShopData.items.map((item, index) => (
                <OwnerItemCard key={index} data={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
