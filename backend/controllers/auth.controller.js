import { compare } from 'bcryptjs';
import User from '../models/user.model.js';
import Document from '../models/document.model.js';

import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
const createToken = (email, name, id) => {
    return jwt.sign({ email, name, id }, process.env.JWT_KEY, { expiresIn: '1d' });
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const user = await User.findOne({ email }).populate('recentDocs.document').exec();
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials. Please check your email and password.' });
        }
        const isPassword = await compare(password, user.password);
        if (!isPassword) {
            return res.status(400).json({ message: 'Invalid credentials. Please check your email and password.' });
        }
        const token = createToken(email, user.name, user.id);
        res.cookie('token', token, {
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
            httpOnly: true,
            secure: false, // ⛔ must be false for HTTP (local testing on LAN)
            sameSite: 'Lax', // ✅ allows cross-origin from mobile if origins match
        });
        user.password = undefined;
        return res.status(200).json({
            message: 'Login Successfull',
            user: user,
            token: token,
            success: true,
        });
    } catch (error) {
        console.warn('Failed to Login :', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const register = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Please provide name, email, and password.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }

        const user = await User.create({ email, name, password });

        if (!user) {
            return res.status(500).json({ message: 'Unable to create user. Please try again.' });
        }

        // // Set secure cookie
        const token = createToken(email, name, user.id);
        res.cookie('token', token, {
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
            httpOnly: true,
            secure: false, // ⛔ must be false for HTTP (local testing on LAN)
            sameSite: 'Lax', // ✅ allows cross-origin from mobile if origins match
        });

        // Do not expose password
        user.password = undefined;

        return res.status(201).json({
            success: true,
            message: 'Registration successful! Welcome aboard.',
            token,
            user,
        });
    } catch (error) {
        await User.deleteOne({ email }); // Optional cleanup
        console.warn('[REGISTER ERROR]', error.message);
        return res.status(500).json({ message: 'Something went wrong during registration. Please try again later.' });
    }
};

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password').populate('recentDocs.document').exec();
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.log('Failed to check auth : ', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
        });

        return res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (error) {
        console.log('Failed to logout : ', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const searchForEmail = async (req, res) => {
    try {
        const emailTerm = req.body?.emailTerm?.trim();
        const editorId = req.body?.editorId?.trim();

        if (!emailTerm || !editorId) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid search term',
            });
        }

        if (emailTerm.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search term must be at least 2 characters long',
            });
        }

        if (!mongoose.Types.ObjectId.isValid(editorId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid document ID',
            });
        }

        // 1️⃣ Fetch document
        const doc = await Document.findById(editorId).select('ownerId collaborators.userId').lean();

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: 'Document not found',
            });
        }

        // 2️⃣ Collect user IDs to exclude
        const excludedUserIds = [doc.ownerId, ...doc.collaborators.map((c) => c.userId)];

        // 3️⃣ Safe regex (prevents regex injection)
        const safeTerm = emailTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // 4️⃣ Search users, excluding owner & collaborators
        const users = await User.find(
            {
                _id: { $nin: excludedUserIds },
                email: { $regex: safeTerm, $options: 'i' },
            },
            { email: 1, name: 1 },
        )
            .limit(10)
            .lean();

        return res.status(200).json({
            success: true,
            count: users.length,
            matchingEmails: users,
        });
    } catch (error) {
        console.error('Failed to search for email:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
