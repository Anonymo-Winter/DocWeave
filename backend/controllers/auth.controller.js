import { compare } from 'bcryptjs';
import User from '../models/user.model.js';
import Document from '../models/document.model.js';

import jwt from 'jsonwebtoken';
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
    if (req.body === undefined) return res.status(400).json({ message: 'Please enter a valid search term' });
    const { emailTerm = '' } = req.body;
    try {
        if (emailTerm === undefined) return res.status(400).json({ message: 'Please enter a valid search term' });
        if (emailTerm.length == 0) {
            return res.status(400).json({ message: 'Please enter a valid search term' });
        }
        const matchingEmails = await User.find({ email: { $regex: emailTerm, $options: 'i' } })
            .select('email name')
            .exec();
        return res.status(200).json({ success: true, matchingEmails });
    } catch (error) {
        console.log('Failed to search for email: ', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
