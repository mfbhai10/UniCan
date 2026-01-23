import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const sendOtpMail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "Your Password Reset OTP",
    html: `<p>Your OTP for password reset is: ${otp}. It is valid for 5 minutes.</p>`,
  });
};

export const sendDeliveryOtp = async (to, otp, orderDetails) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "Your Delivery OTP",
    html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ff4d2d;">Food Delivery - OTP Verification</h2>
                <p>Your order is about to be delivered!</p>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h1 style="color: #ff4d2d; text-align: center; font-size: 36px; margin: 0;">${otp}</h1>
                </div>
                <p>Please share this OTP with your delivery partner to complete the delivery.</p>
                <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes.</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">If you did not order this, please contact support immediately.</p>
            </div>
        `,
  });
};
