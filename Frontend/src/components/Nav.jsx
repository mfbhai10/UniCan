import React, { useState, useMemo } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { ImCross } from "react-icons/im";
import axios from "axios";
import {
  setUserData,
  setSearchQuery,
  resetUserState,
} from "../redux/userSlice";
import { serverUrl } from "../App";
import { FaPlus } from "react-icons/fa6";
import { TbReceiptBitcoin } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

function Nav() {
  const { userData, currentCity, cartItems, searchQuery } = useSelector(
    (state) => state.user,
  );
  const { myShopData } = useSelector((state) => state.owner);
  const { ownerOrders, userOrders } = useSelector((state) => state.order);
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Calculate pending orders count for owner
  const pendingOrdersCount = useMemo(() => {
    if (!ownerOrders) return 0;
    return ownerOrders.filter((order) =>
      order.shopOrder?.some(
        (shopOrder) =>
          shopOrder.status === "pending" || shopOrder.status === "preparing",
      ),
    ).length;
  }, [ownerOrders]);

  const handleLogOut = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signout`,
        {},
        { withCredentials: true },
      );
      dispatch(resetUserState());
      navigate("/"); // Redirect to landing page after logout
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full h-[80px] flex items-center justify-between md:justify-center gap-[40px] px-[20px] fixed top-0 z-[9999] bg-[#fff9f6] overflow-visible">
      {showSearch && userData.role == "user" && (
        <div className="w-[90%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] flex fixed top-[80px] md:hidden">
          <div className="flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400">
            <FaLocationDot size={25} className=" text-[#ff4d2d]" />
            <div className="w-[80%] truncate text-gray-600">{currentCity}</div>
          </div>
          <div className="w-[80%] flex items-center gap-[10px]">
            <FaSearch size={25} className="text-[#ff4d2d] " />
            <input
              type="text"
              placeholder="search delicious food..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="px-[10px]
            text-gray-700 outline-0 w-full"
            />
          </div>
        </div>
      )}

      <h1
        className="text-3xl font-bold mb-2 text-[#ff4d2d] cursor-pointer hover:scale-105 transition-transform"
        onClick={() => navigate("/home")}
      >
        Uni<span className="text-black">Can</span>
      </h1>
      {userData.role == "user" && (
        <div className="md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] hidden md:flex">
          <div className="flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400">
            <FaLocationDot size={25} className=" text-[#ff4d2d]" />
            <div className="w-[80%] truncate text-gray-600">{currentCity}</div>
          </div>
          <div className="w-[80%] flex items-center gap-[10px]">
            <FaSearch size={25} className="text-[#ff4d2d] " />
            <input
              type="text"
              placeholder="search delicious food..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="px-[10px]
            text-gray-700 outline-0 w-full"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {userData.role == "user" &&
          (showSearch ? (
            <ImCross
              size={25}
              className="text-[#ff4d2d] md:hidden cursor-pointer"
              onClick={() => setShowSearch(false)}
            />
          ) : (
            <FaSearch
              size={25}
              className="text-[#ff4d2d] md:hidden cursor-pointer"
              onClick={() => setShowSearch(true)}
            />
          ))}

        {userData.role == "owner" ? (
          <>
            {myShopData && (
              <>
                <button
                  className="hidden md:flex items-center gap-1 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]"
                  onClick={() => navigate("/add-item")}
                >
                  <FaPlus size={20} />
                  <span>Add Food Item</span>
                </button>
                <button
                  className="md:hidden flex items-center cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]"
                  onClick={() => navigate("/add-item")}
                >
                  <FaPlus size={20} />
                </button>
              </>
            )}
            <div
              className="hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium"
              onClick={() => navigate("/owner-orders")}
            >
              <TbReceiptBitcoin size={20} />
              <span>My Orders</span>
              {pendingOrdersCount > 0 && (
                <span className="absolute -right-2 -top-2 text-xs text-white bg-[#ff4d2d] rounded-full px-[6px] py-[1px]">
                  {pendingOrdersCount}
                </span>
              )}
            </div>
            <div
              className="md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium"
              onClick={() => navigate("/owner-orders")}
            >
              <TbReceiptBitcoin size={20} />
              {pendingOrdersCount > 0 && (
                <span className="absolute -right-2 -top-2 text-xs text-white bg-[#ff4d2d] rounded-full px-[6px] py-[1px]">
                  {pendingOrdersCount}
                </span>
              )}
            </div>
          </>
        ) : userData.role == "deliveryBoy" ? (
          <>
            {/* Delivery boy dashboard button removed - already on dashboard */}
          </>
        ) : (
          <>
            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/cart")}
            >
              <FiShoppingCart size={25} className="text-[#ff4d2d]" />
              <span className="absolute right-[-9px] top-[-12px] text-[#ff4d2d]">
                {cartItems.length}
              </span>
            </div>

            <button
              className="hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium cursor-pointer"
              onClick={() => navigate("/user-orders")}
            >
              My Orders
            </button>
          </>
        )}

        <div
          className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer"
          onClick={() => setShowInfo((prev) => !prev)}
        >
          {userData?.fullName.slice(0, 1).toUpperCase()}
        </div>
        {showInfo && (
          <div className="fixed top-[80px] right-[10px] md:right-[10%] lg:right-[15%] w-[180px] bg-white shadow-2xl rounded-xl p-[20px] flex flex-col gap-[10px] z-[9999]">
            <div className="text-[17px] font-semibold">
              {userData?.fullName}
            </div>
            {userData.role == "user" && (
              <div
                className="md:hidden text-[#ff4d2d] font-semibold cursor-pointer"
                onClick={() => navigate("/user-orders")}
              >
                My Orders
              </div>
            )}
            <div
              className="text-[#ff4d2d] font-semibold cursor-pointer"
              onClick={handleLogOut}
            >
              Log Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Nav;
