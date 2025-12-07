import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";

export const signUp = async (req, res) => {
    try {
        const{ fullName, email, password, mobileNumber, role } = req.body;

        const user = await User.findOne({email})
        if(user){
            return res.status(400).json({message:"User already exists"});
        }
        if(password.length < 6){
            return res.status(400).json({message:"Password must be at least 6 characters long"});
        }
        if(mobileNumber.length < 11){
            return res.status(400).json({message:"Mobile number must be at least 11 characters long"});
        }
        const hashedPassword = await bcrypt.hash(password,10);
        user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            mobileNumber,
            role
        });

        const token = await genToken(user._id);
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days(ms)
            httpOnly: true
        })
        return res.status(201).json("User created successfully", user);

    }catch(error){
        return res.status(500).json(`Sign up failed: ${error}`);

    }
}


export const signIn = async (req, res) => {
    try {
        const{ email, password } = req.body;

        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"User does not exist."});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message:"Incorrect password."});
        }
        const token = await genToken(user._id);
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days(ms)
            httpOnly: true
        })
        return res.status(200).json("User signed in successfully", user);

    }catch(error){
        return res.status(500).json(`Sign in failed: ${error}`);
    }
}


export const signOut = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json("User signed out successfully");
    } catch (error) {
        return res.status(500).json(`Sign out failed: ${error}`);
    }
}