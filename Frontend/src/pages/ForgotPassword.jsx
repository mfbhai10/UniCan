import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOtp = async () => {
    try {
        const result = await axios.post(
            `${serverUrl}/api/auth/send-otp`,
            {
              email,
            },
            { withCredentials: true }
          );
          console.log(result);
          setStep(2);
    } catch (error) {
        console.log("Send OTP failed:", error);
    }
  }

  const handleVerifyOtp = async () => {
    try {
        const result = await axios.post(
            `${serverUrl}/api/auth/verify-otp`,
            {
              email,
              otp,
            },
            { withCredentials: true }
          );
          console.log(result);
          setStep(3);
    } catch (error) {
        console.log("Verify OTP failed:", error);
    }
  }

    const handleResetPassword = async () => {
        if(newPassword !== confirmPassword){
            console.log("Passwords do not match");
            return null;
        }
        try {
            const result = await axios.post(
                `${serverUrl}/api/auth/reset-password`,
                {
                email,
                newPassword,
                },
                { withCredentials: true }
            );
            console.log(result);
            navigate("/signin"); 
        } catch (error) {
                console.log("Reset Password failed:", error);
        }
    }

  return (
    <div className="flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-4 mb-4">
          <IoIosArrowRoundBack size={30}
            className="text-[#ff4d2d] cursor-pointer"
            onClick={() => navigate("/signin")}/>
          <h1 className="text-2xl font-bold text-center text-[#ff4d2d]">Forgot Password</h1>
        </div>
        {step == 1 && (
          <div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email
              </label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none border-[1px] border-gray-300 mt-2"
                placeholder="Enter your Email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
            <button
          className={`w-full py-2 rounded-lg font-semibold transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
          onClick={handleSendOtp}
        >
          Sent Otp
        </button>
          </div>
        )}

        {step == 2 && (
          <div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                OTP
              </label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none border-[1px] border-gray-300 mt-2"
                placeholder="Enter OTP"
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
              />
            </div>
            <button
            className={`w-full py-2 rounded-lg font-semibold transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
            onClick={handleVerifyOtp}
            >
            Verify
            </button>
          </div>
        )}

        {step == 3 && (
          <div>
            <div className="mb-4">
              <label
                htmlFor="new password"
                className="block text-gray-700 font-medium mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none border-[1px] border-gray-300 mt-2"
                placeholder="Enter New Password"
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="Confirm password"
                className="block text-gray-700 font-medium mb-1"
              >
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none border-[1px] border-gray-300 mt-2"
                placeholder="Enter Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
              />
            </div>
            <button
            className={`w-full py-2 rounded-lg font-semibold transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
            onClick={handleResetPassword}
            >
            Reset Password
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default ForgotPassword;
