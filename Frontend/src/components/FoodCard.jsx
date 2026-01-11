import React, { useState } from "react";
import { FaLeaf } from "react-icons/fa";
import { FaDrumstickBite } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/userSlice";

function FoodCard({ data }) {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(0);
  const {cartItems} = useSelector(state => state.user);
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="text-yellow-500 text-lg" />
        ) : (
          <FaRegStar key={i} className="text-yellow-500 text-lg" />
        )
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
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h2 className="text-lg font-semibold text-gray-900">{data.name}</h2>
        <div className="flex items-center mt-2 mb-4">
          <div className="flex items-center gap-1 mt-1">
            {renderStars(data.rating?.average || 0)}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            ({data.rating?.count || 0})
          </span>
        </div>

        <div className="mt-auto flex justify-between items-center">
          <span className="text-xl font-bold text-[#ff4d2d]">
            Tk {data.price}
          </span>

          <div className="flex items-center border rounded-full overflow-hidden shadow-sm">
            <button className="px-2 py-1 hover:bg-[#ffe6e0] transition  cursor-pointer" onClick={handleDecrease}>
              <FaMinus size={12} />
            </button>
            <span>{quantity}</span>
            <button className="px-2 py-1 hover:bg-[#ffe6e0] transition  cursor-pointer" onClick={handleIncrease}>
              <FaPlus size={12} />
            </button>
            <button className= {`${cartItems.some(i => i.id == data._id) ? 'bg-gray-800' : 'bg-[#ff4d2d]'} text-white px-3 py-2 transition-colors  cursor-pointer`} onClick={()=>{
              quantity >0 ? dispatch(addToCart(
              {id:data._id,
              name:data.name,
              price:data.price,
              image:data.image,
              shop:data.shop,
              quantity,
              foodType:data.foodType})): null}}>
              <FaShoppingCart size={16}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodCard;
