import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaSearch,
  FaShoppingBag,
  FaMotorcycle,
  FaStore,
  FaClock,
  FaStar,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCheckCircle,
  FaArrowRight,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaUsers,
  FaHeart,
  FaQuoteLeft,
} from "react-icons/fa";
import { MdRestaurant, MdDeliveryDining, MdVerified } from "react-icons/md";
import { IoIosRestaurant } from "react-icons/io";
import { BiSupport } from "react-icons/bi";
import { HiSparkles } from "react-icons/hi";

function LandingPage() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [selectedCity, setSelectedCity] = useState("Dhaka");
  const [searchQuery, setSearchQuery] = useState("");

  // UIU-only delivery zone
  const cities = ["UIU Campus"];

  const stats = [
    { icon: <FaUsers />, number: "700+", label: "UIU Students" },
    { icon: <MdRestaurant />, number: "5+", label: "Campus Canteens" },
    { icon: <FaMotorcycle />, number: "25+", label: "Active Riders" },
    { icon: <FaShoppingBag />, number: "5000+", label: "Orders Delivered" },
  ];

  const testimonials = [
    {
      name: "Sarah Ahmed",
      role: "Student",
      rating: 5,
      text: "Best food delivery service on campus! Always fast and the food arrives hot.",
      avatar:
        "https://ui-avatars.com/api/?name=Sarah+Ahmed&background=ff4d2d&color=fff",
    },
    {
      name: "Kamal Rahman",
      role: "Shop Owner",
      rating: 5,
      text: "My sales have tripled since joining UniCan. Great platform!",
      avatar:
        "https://ui-avatars.com/api/?name=Kamal+Rahman&background=ff4d2d&color=fff",
    },
    {
      name: "Rahim Khan",
      role: "Delivery Rider",
      rating: 5,
      text: "Flexible hours and good earnings. Perfect part-time job for students!",
      avatar:
        "https://ui-avatars.com/api/?name=Rahim+Khan&background=ff4d2d&color=fff",
    },
  ];

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "user") {
        navigate("/home");
      } else if (currentUser.role === "owner") {
        navigate("/owner-dashboard");
      } else if (currentUser.role === "deliveryBoy") {
        navigate("/delivery-boy");
      }
    }
  }, [currentUser, navigate]);

  const handleGetStarted = () => {
    navigate("/signin");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(
        `/signin?redirect=/home&search=${encodeURIComponent(searchQuery)}`
      );
    } else {
      navigate("/signin");
    }
  };

  const features = [
    {
      icon: <FaClock className="text-4xl text-[#ff4d2d]" />,
      title: "Fast Delivery",
      description: "Get your food delivered in 5 minutes or less",
    },
    {
      icon: <MdRestaurant className="text-4xl text-[#ff4d2d]" />,
      title: "All UIU Canteens",
      description: "Access all campus canteens from one platform",
    },
    {
      icon: <FaMoneyBillWave className="text-4xl text-[#ff4d2d]" />,
      title: "Flexible Payment",
      description: "Pay with cash on delivery or online payment",
    },
    {
      icon: <FaMapMarkerAlt className="text-4xl text-[#ff4d2d]" />,
      title: "Real-time Tracking",
      description: "Track your order from kitchen to your doorstep",
    },
    {
      icon: <FaStar className="text-4xl text-[#ff4d2d]" />,
      title: "Rate & Review",
      description: "Share your experience and help others decide",
    },
    {
      icon: <BiSupport className="text-4xl text-[#ff4d2d]" />,
      title: "24/7 Support",
      description: "We're always here to help you with any issues",
    },
  ];

  const howItWorks = [
    {
      icon: <FaSearch className="text-5xl text-white" />,
      title: "Browse & Select",
      description: "Search for your favorite food items from multiple shops",
      step: "1",
    },
    {
      icon: <FaShoppingBag className="text-5xl text-white" />,
      title: "Place Order",
      description: "Add to cart, choose payment method and confirm order",
      step: "2",
    },
    {
      icon: <FaMotorcycle className="text-5xl text-white" />,
      title: "Get Delivered",
      description: "Track your order and receive it at your location",
      step: "3",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Navbar */}
      <nav className="w-full bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className="relative">
                <IoIosRestaurant className="text-[#ff4d2d] text-4xl group-hover:scale-110 transition-transform" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-3xl font-extrabold text-gray-900">
                  <a href="/">
                    Uni<span className="text-[#ff4d2d] transition">Can</span>
                  </a>
                </span>
                <p className="text-xs text-gray-500 -mt-1">
                  UIU Campus Food Delivery
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                className="text-gray-700 hover:text-[#ff4d2d] font-medium transition"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-700 hover:text-[#ff4d2d] font-medium transition"
              >
                How It Works
              </a>
              <a
                href="#partners"
                className="text-gray-700 hover:text-[#ff4d2d] font-medium transition"
              >
                For Partners
              </a>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/signin")}
                className="text-gray-700 hover:text-[#ff4d2d] font-semibold transition px-4 py-2"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-white to-yellow-50 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 z-10 order-1">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-orange-100">
                <HiSparkles className="text-[#ff4d2d]" />
                <span className="text-sm font-semibold text-gray-700">
                  🎉 Now Live at UIU Campus!
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
                Craving
                <br />
                <span className="bg-gradient-to-r from-[#ff4d2d] to-orange-500 bg-clip-text text-transparent">
                  Delicious Food?
                </span>
                <br />
                <span className="text-4xl sm:text-5xl">We'll Deliver It</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Get your favorite meals from{" "}
                <span className="font-bold text-gray-900">
                  United International University
                </span>{" "}
                canteens delivered hot and fresh to your doorstep in just
                <span className="font-bold text-[#ff4d2d]"> 5 minutes</span> or
                less!
              </p>

              {/* City & Search */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* City Selector */}
                  <div className="flex items-center gap-3 bg-white px-4 py-4 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-[#ff4d2d] transition-all">
                    <FaMapMarkerAlt className="text-[#ff4d2d] text-2xl" />
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="px-2 py-1 border-none outline-none text-gray-900 font-semibold bg-transparent cursor-pointer text-lg"
                    >
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="flex-1 relative group">
                      <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff4d2d] transition" />
                      <input
                        type="text"
                        placeholder="Search for biriyani, burger..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#ff4d2d] outline-none text-gray-900 shadow-lg font-medium hover:shadow-xl transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all font-bold flex items-center gap-2 hover:scale-105"
                    >
                      <FaSearch />
                      <span className="hidden sm:inline">Find Food</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleGetStarted}
                  className="group bg-gradient-to-r from-[#ff4d2d] to-orange-500 text-white px-10 py-5 rounded-2xl hover:shadow-2xl transition-all font-bold text-lg flex items-center gap-3 hover:scale-105"
                >
                  <FaShoppingBag className="text-xl" />
                  Order Now
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-white text-[#ff4d2d] border-2 border-[#ff4d2d] px-10 py-5 rounded-2xl hover:bg-orange-50 transition-all font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <FaStore className="text-xl" />
                  Join as Partner
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm"
                      >
                        {i}K
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-gray-900">700+ UIU Students</p>
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400 text-xs" />
                      <FaStar className="text-yellow-400 text-xs" />
                      <FaStar className="text-yellow-400 text-xs" />
                      <FaStar className="text-yellow-400 text-xs" />
                      <FaStar className="text-yellow-400 text-xs" />
                      <span className="text-xs text-gray-600 ml-1">
                        (4.9/5)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                  <MdVerified className="text-green-600 text-xl" />
                  <span className="text-sm font-semibold text-green-700">
                    100% Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Right Image/Illustration */}
            <div className="relative lg:block order-2 mt-10 lg:mt-0">
              <div className="relative z-[1]">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVsaWNpb3VzJTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
                    alt="Delicious Food"
                    className="w-full h-auto object-cover"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -top-6 -right-6 bg-white p-5 rounded-2xl shadow-2xl animate-float border-4 border-orange-100 z-[10]">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#ff4d2d] to-orange-500 rounded-full flex items-center justify-center">
                    <FaClock className="text-white text-2xl" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-2xl">5 min</p>
                    <p className="text-sm text-gray-600">Fast Delivery</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-2xl animate-float animation-delay-1000 border-4 border-yellow-100 z-[10]">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <FaStar className="text-white text-2xl" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-2xl">4.9★</p>
                    <p className="text-sm text-gray-600">Top Rated</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 -left-10 bg-white p-4 rounded-2xl shadow-2xl animate-bounce border-4 border-green-100 z-[10]">
                <div className="flex items-center gap-2">
                  <FaHeart className="text-red-500 text-xl" />
                  <div>
                    <p className="font-bold text-gray-900">5+</p>
                    <p className="text-xs text-gray-600">Restaurants</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <div className="text-3xl text-[#ff4d2d]">{stat.icon}</div>
                </div>
                <p className="text-4xl font-extrabold text-gray-900 mb-1">
                  {stat.number}
                </p>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full mb-4">
              <HiSparkles className="text-[#ff4d2d]" />
              <span className="text-sm font-bold text-[#ff4d2d]">
                HOW IT WORKS
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              Order in <span className="text-[#ff4d2d]">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting your favorite food has never been easier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Lines */}
            <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-1 bg-gradient-to-r from-[#ff4d2d] via-orange-400 to-[#ff4d2d]"></div>

            {howItWorks.map((item, index) => (
              <div key={index} className="relative group">
                <div className="bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border-2 border-gray-100 hover:border-[#ff4d2d]">
                  {/* Step Number Badge */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-[#ff4d2d] to-orange-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                    <span className="text-2xl font-extrabold text-white">
                      {item.step}
                    </span>
                  </div>

                  {/* Icon Container */}
                  <div className="mb-6 mt-8 flex justify-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#ff4d2d] to-orange-500 rounded-3xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl">
                      {item.icon}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full mb-4">
              <HiSparkles className="text-[#ff4d2d]" />
              <span className="text-sm font-bold text-[#ff4d2d]">
                WHY CHOOSE US
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              Features That Make Us{" "}
              <span className="text-[#ff4d2d]">Stand Out</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Serving UIU campus with the best food delivery experience and
              modern features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100 hover:border-[#ff4d2d] cursor-pointer"
              >
                <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#ff4d2d] transition">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full mb-4">
              <FaStar className="text-[#ff4d2d]" />
              <span className="text-sm font-bold text-[#ff4d2d]">
                TESTIMONIALS
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              What Our <span className="text-[#ff4d2d]">Users Say</span>
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from real people who love UniCan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full border-4 border-orange-100"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-lg" />
                  ))}
                </div>

                <div className="relative">
                  <FaQuoteLeft className="absolute -top-2 -left-2 text-3xl text-orange-100" />
                  <p className="text-gray-700 leading-relaxed pl-6 italic">
                    "{testimonial.text}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Section */}
      <section
        id="partners"
        className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-orange-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full mb-4">
              <FaUsers className="text-[#ff4d2d]" />
              <span className="text-sm font-bold text-[#ff4d2d]">JOIN US</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              Become a <span className="text-[#ff4d2d]">Partner</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join UIU's largest food delivery platform and grow with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Shop Owners */}
            <div className="group relative bg-gradient-to-br from-[#ff4d2d] to-orange-600 rounded-3xl p-10 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden hover:scale-105">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FaStore className="text-6xl" />
                </div>
                <h3 className="text-4xl font-extrabold mb-4">
                  For Shop Owners
                </h3>
                <p className="text-orange-100 mb-8 text-lg leading-relaxed">
                  Partner with UIU's food delivery platform and reach thousands
                  of hungry students. Boost your sales instantly!
                </p>
                <ul className="space-y-4 mb-10">
                  {[
                    "📈 Increase sales up to 3x",
                    "💻 Easy order management dashboard",
                    "💰 Real-time earnings tracking",
                    "🎯 Zero registration fees",
                    "📊 Business analytics & insights",
                    "🚀 Instant order notifications",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-lg">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/signup")}
                  className="w-full bg-white text-[#ff4d2d] px-8 py-5 rounded-2xl hover:bg-orange-50 transition-all font-bold shadow-xl text-lg flex items-center justify-center gap-3 group-hover:scale-105"
                >
                  <FaStore className="text-xl" />
                  Register Your Shop
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* For Delivery Boys */}
            <div className="group relative bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-10 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden hover:scale-105">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 -translate-x-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-y-1/2 translate-x-1/2"></div>
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MdDeliveryDining className="text-6xl" />
                </div>
                <h3 className="text-4xl font-extrabold mb-4">
                  For Delivery Boys
                </h3>
                <p className="text-blue-100 mb-8 text-lg leading-relaxed">
                  Earn money on your schedule by delivering food to UIU
                  students. Perfect for part-time income!
                </p>
                <ul className="space-y-4 mb-10">
                  {[
                    "⏰ Flexible working hours",
                    "💵 ৳20 per delivery + tips",
                    "💸 Daily earnings payout",
                    "🎯 Smart order assignment",
                    "📱 Easy-to-use mobile app",
                    "🏆 Performance bonuses",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-lg">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/signup")}
                  className="w-full bg-white text-blue-600 px-8 py-5 rounded-2xl hover:bg-blue-50 transition-all font-bold shadow-xl text-lg flex items-center justify-center gap-3 group-hover:scale-105"
                >
                  <MdDeliveryDining className="text-xl" />
                  Become a Delivery Boy
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <IoIosRestaurant className="text-[#ff4d2d] text-4xl" />
                <div>
                  <span className="text-3xl font-extrabold">
                    Uni<span className="text-[#ff4d2d]">Can</span>
                  </span>
                  <p className="text-xs text-gray-400 -mt-1">
                    UIU Campus Food Delivery
                  </p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                Delivering happiness one meal at a time to United International
                University students. Hot, fresh, and delicious food in just 5
                minutes!
              </p>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-[#ff4d2d] transition-all cursor-pointer hover:scale-110 transform">
                  <FaFacebook className="text-xl" />
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-[#ff4d2d] transition-all cursor-pointer hover:scale-110 transform">
                  <FaInstagram className="text-xl" />
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-[#ff4d2d] transition-all cursor-pointer hover:scale-110 transform">
                  <FaTwitter className="text-xl" />
                </div>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform">
                  About Us
                </li>
                <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform">
                  Careers
                </li>
                <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform">
                  Blog
                </li>
                <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform">
                  Press Kit
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform">
                  Help Center
                </li>
                <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform">
                  Contact Us
                </li>
                <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform">
                  FAQ
                </li>
                <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform">
                  Safety
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform">
                  Terms of Service
                </li>
                <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform">
                  Privacy Policy
                </li>
                <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform">
                  Cookie Policy
                </li>
                <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform">
                  Refund Policy
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} UniCan. All rights reserved.
                Made with ❤️ for UIU students.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#ff4d2d]" />
                  UIU Campus, Dhaka
                </span>
                <span className="flex items-center gap-2">
                  <FaClock className="text-[#ff4d2d]" />
                  24/7 Service
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
