import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import { useSelector } from "react-redux";
import Home from "./pages/Home";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import CreateEditShop from "./pages/CreateEditShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemsByCity from "./hooks/useGetItemsByCity";
import CartPage from "./pages/CartPage";
import CheckOut from "./pages/CheckOut";
import useGetOrders from "./hooks/useGetOrders";
import useCart from "./hooks/useCart";
import UserMyOrders from "./pages/UserMyOrders";
import OwnerMyOrders from "./pages/OwnerMyOrders";
import DeliveryBoy from "./components/DeliveryBoy";
import TrackOrder from "./pages/TrackOrder";
import LandingPage from "./pages/LandingPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import PaymentCancel from "./pages/PaymentCancel";

export const serverUrl = "http://localhost:8000";
const App = () => {
  useGetCurrentUser();
  useGetCity();
  useGetMyShop();
  useGetShopByCity();
  useGetItemsByCity();
  useGetOrders();
  useCart();
  const { userData } = useSelector((state) => state.user);
  return (
    <Routes>
      {/* Landing Page - Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to={"/home"} />}
      />
      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to={"/home"} />}
      />
      <Route
        path="/forgot-password"
        element={!userData ? <ForgotPassword /> : <Navigate to={"/home"} />}
      />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={userData ? <Home /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/create-edit-shop"
        element={userData ? <CreateEditShop /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/add-item"
        element={userData ? <AddItem /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/edit-item/:itemId"
        element={userData ? <EditItem /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/cart"
        element={userData ? <CartPage /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/checkout"
        element={userData ? <CheckOut /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/user-orders"
        element={userData ? <UserMyOrders /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/owner-orders"
        element={userData ? <OwnerMyOrders /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/delivery-dashboard"
        element={userData ? <DeliveryBoy /> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/track-order/:orderId"
        element={userData ? <TrackOrder /> : <Navigate to={"/signin"} />}
      />

      {/* Payment Routes */}
      <Route path="/payment/success/:orderId" element={<PaymentSuccess />} />
      <Route path="/payment/fail/:orderId" element={<PaymentFail />} />
      <Route path="/payment/cancel/:orderId" element={<PaymentCancel />} />
    </Routes>
  );
};

export default App;
