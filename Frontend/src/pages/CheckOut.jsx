import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { serverUrl } from "../App";
import { setUserOrders } from "../redux/orderSlice";
import { clearCart } from "../redux/userSlice";

function CheckOut() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, totalAmount } = useSelector((state) => state.user);
  const DELIVERY_FEE = 20;

  const [deliveryLocation, setDeliveryLocation] = useState({
    floor: "",
    roomNo: "",
    area: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryLocation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async () => {
    // Validate inputs
    if (
      !deliveryLocation.floor ||
      !deliveryLocation.roomNo ||
      !deliveryLocation.area
    ) {
      alert("Please fill in all delivery location fields");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    setLoading(true);

    // Prepare delivery address text
    const deliveryAddressText = `Floor: ${deliveryLocation.floor}, Room: ${deliveryLocation.roomNo}, Area: ${deliveryLocation.area}`;

    // Calculate floor number for distance calculation (Canteen is at Ground Floor = 0)
    const floorMap = {
      "Base Floor": -1,
      "Ground Floor": 0,
      "1st Floor": 1,
      "2nd Floor": 2,
      "3rd Floor": 3,
      "4th Floor": 4,
      "5th Floor": 5,
      "6th Floor": 6,
      "7th Floor": 7,
      "8th Floor": 8,
      "9th Floor": 9,
      "10th Floor": 10,
    };

    const floorNumber = floorMap[deliveryLocation.floor] || 0;

    try {
      // Group cart items by shop
      const shopOrderMap = {};

      cartItems.forEach((item) => {
        const shopId = item.shopId;
        const ownerId = item.ownerId;

        if (!shopOrderMap[shopId]) {
          shopOrderMap[shopId] = {
            shop: shopId,
            owner: ownerId,
            subtotal: 0,
            shopOrderItems: [],
          };
        }

        shopOrderMap[shopId].shopOrderItems.push({
          item: item.id,
          price: item.price,
          quantity: item.quantity,
        });

        shopOrderMap[shopId].subtotal += item.price * item.quantity;
      });

      const shopOrder = Object.values(shopOrderMap);

      const orderData = {
        paymentMethod,
        deliveryAddress: {
          text: deliveryAddressText,
          floor: deliveryLocation.floor,
          roomNo: deliveryLocation.roomNo,
          area: deliveryLocation.area,
          floorNumber: floorNumber,
        },
        totalAmount: totalAmount + DELIVERY_FEE,
        shopOrder,
      };

      // For Cash on Delivery
      if (paymentMethod === "cod") {
        const response = await fetch(`${serverUrl}/api/order/place-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(orderData),
        });

        const data = await response.json();

        if (response.ok) {
          // Clear the cart from backend
          await fetch(`${serverUrl}/api/cart/clear`, {
            method: "DELETE",
            credentials: "include",
          });

          // Clear cart in Redux
          dispatch(clearCart());

          alert("Order placed successfully!");

          // Fetch updated orders
          const ordersRes = await fetch(`${serverUrl}/api/order/user-orders`, {
            method: "GET",
            credentials: "include",
          });

          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            dispatch(setUserOrders(ordersData));
          }

          navigate("/user-orders");
        } else {
          throw new Error(data.message || "Failed to place order");
        }
      }
      // For Online Payment
      else if (paymentMethod === "online") {
        // First, create the order
        const response = await fetch(`${serverUrl}/api/order/place-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: "Failed to create order",
          }));
          throw new Error(errorData.message || "Failed to create order");
        }

        const data = await response.json();
        const orderId = data._id;

        console.log("Order created:", orderId);

        // Initialize payment with SSLCommerz
        const paymentResponse = await fetch(`${serverUrl}/api/payment/init`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ orderId }),
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json().catch(() => ({
            message: "Failed to initialize payment",
          }));
          console.error("Payment init error:", errorData);
          throw new Error(errorData.message || "Failed to initialize payment");
        }

        const paymentData = await paymentResponse.json();
        console.log("Payment gateway response:", paymentData);

        if (paymentData.success && paymentData.gatewayUrl) {
          // Clear cart from backend before redirecting to payment gateway
          await fetch(`${serverUrl}/api/cart/clear`, {
            method: "DELETE",
            credentials: "include",
          });

          // Clear cart in Redux
          dispatch(clearCart());

          // Redirect to SSLCommerz payment gateway
          window.location.href = paymentData.gatewayUrl;
        } else {
          throw new Error(
            paymentData.message ||
              paymentData.details?.failedreason ||
              "Failed to initialize payment gateway",
          );
        }
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert(error.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center p-6">
      <div className="w-full max-w-[800px]">
        {/* Header */}
        <div className="flex items-center gap-[20px] mb-6">
          <div
            className="z-[10] cursor-pointer"
            onClick={() => navigate("/cart")}
          >
            <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
          </div>
          <h1 className="text-2xl font-bold text-start">Checkout</h1>
        </div>

        {/* Delivery Location Section */}
        <div className="bg-white rounded-xl shadow border-2 border-gray-200 p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <MdLocationOn size={24} className="text-[#ff4d2d]" />
            <h2 className="text-xl font-bold text-gray-800">
              Delivery Location
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Floor <span className="text-red-500">*</span>
              </label>
              <select
                name="floor"
                value={deliveryLocation.floor}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent bg-white cursor-pointer"
              >
                <option value="">Select Floor</option>
                <option value="Base Floor">Base Floor</option>
                <option value="Ground Floor">Ground Floor</option>
                <option value="1st Floor">1st Floor</option>
                <option value="2nd Floor">2nd Floor</option>
                <option value="3rd Floor">3rd Floor</option>
                <option value="4th Floor">4th Floor</option>
                <option value="5th Floor">5th Floor</option>
                <option value="6th Floor">6th Floor</option>
                <option value="7th Floor">7th Floor</option>
                <option value="8th Floor">8th Floor</option>
                <option value="9th Floor">9th Floor</option>
                <option value="10th Floor">10th Floor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="roomNo"
                value={deliveryLocation.roomNo}
                onChange={handleInputChange}
                placeholder="e.g., Room 301"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exact Area <span className="text-red-500">*</span>
              </label>
              <textarea
                name="area"
                value={deliveryLocation.area}
                onChange={handleInputChange}
                placeholder="e.g., Near the library, Gym, etc."
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Payment Method Section */}
        <div className="bg-white rounded-xl shadow border-2 border-gray-200 p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Payment Method
          </h2>

          <div className="flex flex-col md:flex-row gap-3">
            <div
              onClick={() => setPaymentMethod("cod")}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition flex-1 ${
                paymentMethod === "cod"
                  ? "border-[#ff4d2d] bg-[#fff9f6]"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                className="w-5 h-5 text-[#ff4d2d] focus:ring-[#ff4d2d] cursor-pointer"
              />
              <label className="ml-3 flex-1 cursor-pointer">
                <div className="font-semibold text-gray-800">
                  Cash on Delivery
                </div>
                <div className="text-sm text-gray-600">
                  Pay with cash when your order arrives
                </div>
              </label>
            </div>

            <div
              onClick={() => setPaymentMethod("online")}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition flex-1 ${
                paymentMethod === "online"
                  ? "border-[#ff4d2d] bg-[#fff9f6]"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="online"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
                className="w-5 h-5 text-[#ff4d2d] focus:ring-[#ff4d2d] cursor-pointer"
              />
              <label className="ml-3 flex-1 cursor-pointer">
                <div className="font-semibold text-gray-800">
                  Online Payment
                </div>
                <div className="text-sm text-gray-600">
                  Pay securely using bKash, Nagad, or card
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="bg-white rounded-xl shadow border-2 border-gray-200 p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Order Summary
          </h2>

          <div className="space-y-3">
            {cartItems?.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-gray-700"
              >
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span className="font-medium">
                  ৳ {item.price * item.quantity}
                </span>
              </div>
            ))}

            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center text-gray-700 mb-2">
                <span>Subtotal</span>
                <span className="font-medium">৳ {totalAmount}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700 mb-2">
                <span>Delivery Fee</span>
                <span className="font-medium">৳ {DELIVERY_FEE}</span>
              </div>
            </div>

            <div className="border-t pt-3 mt-3 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Total Amount</h3>
              <span className="text-2xl font-bold text-[#ff4d2d]">
                ৳ {totalAmount + DELIVERY_FEE}
              </span>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-[#ff4d2d] text-white px-6 py-4 rounded-lg text-lg font-medium hover:bg-[#e64526] transition cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}

export default CheckOut;
