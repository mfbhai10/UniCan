import React, { useEffect, useRef, useState } from "react";
import Nav from "./Nav.jsx";
import { categories } from "../category.js";
import CategoryCard from "./CategoryCard.jsx";
import ShopCard from "./ShopCard.jsx";
import { FaHandPointLeft } from "react-icons/fa";
import { FaHandPointRight } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import FoodCard from "./FoodCard.jsx";
import {
  setSelectedCategory,
  setSelectedShop,
  setSearchQuery,
} from "../redux/userSlice.js";

function UserDashboard() {
  const dispatch = useDispatch();
  const {
    currentCity,
    shopInMyCity,
    itemsInMyCity,
    selectedCategory,
    selectedShop,
    searchQuery,
  } = useSelector((state) => state.user);
  const cateScrollRef = useRef();
  const shopScrollRef = useRef();
  const [showLeftCateButton, setShowLeftCateButton] = useState(false);
  const [showRightCateButton, setShowRightCateButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current;
    if (element) {
      setLeftButton(element.scrollLeft > 0);
      setRightButton(
        element.scrollLeft + element.clientWidth < element.scrollWidth,
      );
    }
  };

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  // Filter items based on selected category, shop, and search query
  useEffect(() => {
    if (itemsInMyCity) {
      let filtered = itemsInMyCity;

      // Filter by search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            (item.shop?.name && item.shop.name.toLowerCase().includes(query)),
        );
      }

      // Filter by category
      if (selectedCategory !== "All") {
        filtered = filtered.filter(
          (item) => item.category === selectedCategory,
        );
      }

      // Filter by shop
      if (selectedShop) {
        filtered = filtered.filter(
          (item) => item.shop._id === selectedShop._id,
        );
      }

      setFilteredItems(filtered);
    }
  }, [selectedCategory, selectedShop, searchQuery, itemsInMyCity]);

  useEffect(() => {
    if (cateScrollRef.current) {
      updateButton(
        cateScrollRef,
        setShowLeftCateButton,
        setShowRightCateButton,
      );
      updateButton(
        shopScrollRef,
        setShowLeftShopButton,
        setShowRightShopButton,
      );
      cateScrollRef.current.addEventListener("scroll", () => {
        updateButton(
          cateScrollRef,
          setShowLeftCateButton,
          setShowRightCateButton,
        );
        updateButton(
          shopScrollRef,
          setShowLeftShopButton,
          setShowRightShopButton,
        );
      });
      shopScrollRef.current.addEventListener("scroll", () => {
        updateButton(
          shopScrollRef,
          setShowLeftShopButton,
          setShowRightShopButton,
        );
      });
    }

    return () => {
      cateScrollRef?.current?.removeEventListener("scroll", () => {
        updateButton(
          cateScrollRef,
          setShowLeftCateButton,
          setShowRightCateButton,
        );
      });
      shopScrollRef?.current?.removeEventListener("scroll", () => {
        updateButton(
          shopScrollRef,
          setShowLeftShopButton,
          setShowRightShopButton,
        );
      });
    };
  }, [categories]);

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col gap-5 items-center overflow-y-auto">
      <Nav />
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-2xl sm:text-3xl text-gray-900">
          Fresh Picks Just for You
        </h1>
        <div className="w-full relative">
          {showLeftCateButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#ff4d2d]"
              onClick={() => scrollHandler(cateScrollRef, "left")}
            >
              <FaHandPointLeft />
            </button>
          )}

          <div
            className="w-full flex overflow-x-auto gap-4 pb-2 "
            ref={cateScrollRef}
          >
            {/* All Category Card */}
            <CategoryCard
              key="all"
              name="All"
              image={categories[0].image}
              onClick={() => dispatch(setSelectedCategory("All"))}
              isActive={selectedCategory === "All"}
            />
            {categories.map((cate, index) => (
              <CategoryCard
                key={index}
                name={cate.category}
                image={cate.image}
                onClick={() => dispatch(setSelectedCategory(cate.category))}
                isActive={selectedCategory === cate.category}
              />
            ))}
          </div>
          {showRightCateButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#ff4d2d]"
              onClick={() => scrollHandler(cateScrollRef, "right")}
            >
              <FaHandPointRight />
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-2xl sm:text-3xl text-gray-900">
            Best Shops in {currentCity}
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Total:</span>
            <span className="bg-[#ff4d2d] text-white px-3 py-1 rounded-full font-semibold">
              {shopInMyCity?.length || 0} shops
            </span>
          </div>
        </div>
        <div className="w-full relative">
          {showLeftShopButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#ff4d2d]"
              onClick={() => scrollHandler(shopScrollRef, "left")}
            >
              <FaHandPointLeft />
            </button>
          )}

          <div
            className="w-full flex overflow-x-auto gap-4 pb-2 "
            ref={shopScrollRef}
          >
            {/* All Shops Card */}
            <ShopCard
              key="all-shops"
              shop={{
                name: "All Shops",
                image: shopInMyCity?.[0]?.image || categories[0].image,
                address: `Browse all shops in ${currentCity}`,
                city: currentCity,
                items: itemsInMyCity || [],
              }}
              onClick={() => dispatch(setSelectedShop(null))}
              isActive={selectedShop === null}
            />
            {shopInMyCity?.map((shop, index) => (
              <ShopCard
                key={index}
                shop={shop}
                onClick={() => dispatch(setSelectedShop(shop))}
                isActive={selectedShop?._id === shop._id}
              />
            ))}
          </div>
          {showRightShopButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#ff4d2d]"
              onClick={() => scrollHandler(shopScrollRef, "right")}
            >
              <FaHandPointRight />
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl text-gray-900">
              {searchQuery.trim() !== ""
                ? `Search Results for "${searchQuery}"`
                : selectedShop
                  ? `${selectedShop.name} - Menu`
                  : selectedCategory === "All"
                    ? "Suggested Food for You"
                    : `${selectedCategory} Items`}
            </h1>
            {(selectedCategory !== "All" ||
              selectedShop ||
              searchQuery.trim() !== "") && (
              <div className="flex items-center gap-2 flex-wrap">
                {searchQuery.trim() !== "" && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                    Search: <strong>{searchQuery}</strong>
                  </span>
                )}
                {selectedCategory !== "All" && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
                    Category: <strong>{selectedCategory}</strong>
                  </span>
                )}
                {selectedShop && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                    Shop: <strong>{selectedShop.name}</strong>
                  </span>
                )}
                <button
                  onClick={() => {
                    dispatch(setSelectedCategory("All"));
                    dispatch(setSelectedShop(null));
                    dispatch(setSearchQuery(""));
                  }}
                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full hover:bg-red-200 transition"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Showing:</span>
            <span className="bg-[#ff4d2d] text-white px-3 py-1 rounded-full font-semibold">
              {filteredItems?.length || 0} items
            </span>
          </div>
        </div>

        <div className="w-full h-auto flex flex-wrap gap-[20px] justify-center">
          {filteredItems && filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <FoodCard key={index} data={item} />
            ))
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">🍽️</div>
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                No items found
              </h2>
              <p className="text-gray-500 text-center mb-4">
                {searchQuery.trim() !== ""
                  ? `No results found for "${searchQuery}"`
                  : selectedShop
                    ? `No items available in ${selectedShop.name}`
                    : selectedCategory === "All"
                      ? "No food items available in your city"
                      : `No ${selectedCategory} items available`}
              </p>
              {(selectedCategory !== "All" ||
                selectedShop ||
                searchQuery.trim() !== "") && (
                <button
                  onClick={() => {
                    dispatch(setSelectedCategory("All"));
                    dispatch(setSelectedShop(null));
                    dispatch(setSearchQuery(""));
                  }}
                  className="bg-[#ff4d2d] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#e64526] transition"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
