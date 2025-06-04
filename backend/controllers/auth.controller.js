import { compare } from "bcryptjs";
import User from "../models/user.model.js";
import Document from "../models/document.model.js";

import jwt from "jsonwebtoken";
const createToken = (email, id) => {
    return jwt.sign({ email, id }, process.env.JWT_KEY, { expiresIn: 1 * 24 * 60 * 60 * 1000 });
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const user = await User.findOne({ email }).populate("recentDocs.document").exec();
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const isPassword = await compare(password, user.password);
        if (!isPassword) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        res.cookie("token", createToken(email, user.id), {
            maxAge: 1 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });
        user.password = undefined;
        return res.status(200).json({
            message: "Login Successfull",
            user: user,
        });
    } catch (error) {
        console.warn("Failed to Login :", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const register = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        if (!email || !password || !name) {
            return res.status(400).json({ error: "All fields are required" });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be atleast 8 characters long" });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "Email already in use" });
        }
        const user = await User.create({ email, name, password });
        if (!user) {
            return res.status(400).json({ error: "Failed to create user" });
        }
        res.cookie("token", createToken(email, user.id), {
            maxAge: 1 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });
        user.password = undefined;
        return res.status(201).json({
            message: "Registration Successfull",
            user: user,
        });
    } catch (error) {
        await User.deleteOne({ email });
        console.warn("Failed to register :", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password").populate("recentDocs.document").exec();
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Failed to check auth : ", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};
