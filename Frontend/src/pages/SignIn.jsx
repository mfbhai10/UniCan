import React from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { ClipLoader } from "react-spinners";
import { setUserData } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from "../../firebase";

function SignIn() {
  const primaryColor = "#ff4d2d";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data));
      setErr("");
      setLoading(false);
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    
    try {
      const Provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, Provider);
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,{
          email: result.user.email
        },
        { withCredentials: true }
      );
      dispatch(setUserData(data));
    } catch (error) {
      console.log("Google sign in failed:", error);
    } 
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className={`bg-white p-8 rounded-xl shadow-lg w-full max-w-md`}
        style={{ border: `1px solid ${borderColor}` }}
      >
        <h1
          className={`text-3xl font-bold mb-6`}
          style={{ color: primaryColor }}
        >
          Uni<span className="text-black">Can</span>
        </h1>
        <p className="text-gray-600 mb-8">
          Sign in to your account to continue enjoying delicious food deliveries
        </p>

        {/* email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1"
          >
            Email
          </label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none"
            placeholder="Enter your Email"
            style={{ border: `1px solid ${borderColor}` }}
            onChange={(e) => setEmail(e.target.value)}
            value={email} required
          />
        </div>

        {/* password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none"
              placeholder="Enter your Password"
              style={{ border: `1px solid ${borderColor}` }}
              onChange={(e) => setPassword(e.target.value)}
              value={password} required
            />
            <button
              className="absolute right-3 cursor-pointer top-[15px] text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>

        <div
          className="text-right mb-4 font-medium text-[#ff4c2de4] cursor-pointer"
          onClick={() => {
            navigate("/forgot-password");
          }}
        >
          Forgot Password?
        </div>

        <button
          className={`w-full py-2 rounded-lg font-semibold transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
          onClick={handleSignIn} disabled={loading}
        >
          {loading ? <ClipLoader size={20}/> : "Sign In"}
        </button>
        {err && <p className="text-red-600 text-center my-5">*{err}</p>}

        <button className="w-full py-2 rounded-lg font-semibold transition duration-200 bg-white text-gray-700 hover:bg-gray-100 cursor-pointer border border-gray-300 mt-4 flex items-center justify-center "
          onClick={handleGoogleAuth} >
          <FcGoogle size={20} className="inline-block mr-2" />
          <span>Sign In with Google</span>
        </button>
        <p
          className="text-center mt-6 cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Want to create a new account ?{" "}
          <span className="text-[#ff4d2d]">Sign Up</span>{" "}
        </p>
      </div>
    </div>
  );
}

export default SignIn;
