import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobileNumber, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    if (mobileNumber.length < 11) {
      return res
        .status(400)
        .json({ message: "Mobile number must be at least 11 characters long" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      mobileNumber,
      role,
    });

    const token = await genToken(user._id);
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days(ms)
      httpOnly: true,
    });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json(`Sign up failed: ${error}`);
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password." });
    }
    const token = await genToken(user._id);
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days(ms)
      httpOnly: true,
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(`Sign in failed: ${error}`);
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json("User signed out successfully");
  } catch (error) {
    return res.status(500).json(`Sign out failed: ${error}`);
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes from now
    user.isOtpVerified = false;
    await user.save();

    // send OTP via email
    await sendOtpMail(email, otp);

    return res.status(200).json({ message: "OTP sent to email." });
  } catch (error) {
    return res.status(500).json(`Send OTP failed: ${error}`);
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }
    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    user.resetOtp = undefined;
    user.otpExpires = undefined;
    user.isOtpVerified = true;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    return res.status(500).json(`Verify OTP failed: ${error}`);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
    if (!user.isOtpVerified) {
      return res.status(400).json({ message: "OTP not verified." });
    }
    // if(newPassword.length < 6){
    //     return res.status(400).json({message:"Password must be at least 6 characters long"});
    // }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    return res.status(500).json(`Reset Password failed: ${error}`);
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { fullName, email, mobileNumber, role } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      const placeholderPassword = await bcrypt.hash(
        Math.random().toString(36).slice(-10),
        10
      );
      user = await User.create({
        fullName,
        email,
        password: placeholderPassword,
        mobileNumber,
        role,
      });
    }
    const token = await genToken(user._id);
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days(ms)
      httpOnly: true,
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(`Google Auth failed: ${error}`);
  }
};
