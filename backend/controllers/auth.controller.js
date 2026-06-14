import { compare } from 'bcryptjs';
import crypto from 'node:crypto';
import User from '../models/user.model.js';
import Document from '../models/document.model.js';
import { sendPasswordReset, sendWelcome } from '../util/sendEmail.js';
import { CLIENT_URL, isProduction } from '../config.js';

import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
const createToken = (email, name, id) => {
    return jwt.sign({ email, name, id }, process.env.JWT_KEY, { expiresIn: '1d' });
};

// Shared, environment-aware cookie options so the session cookie is set, sent,
// and cleared consistently. In production the frontend and API are on different
// subdomains, so the cookie must be cross-site (`SameSite=None; Secure`); locally
// it stays `Lax`/non-secure so it works over http.
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
};
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day

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
        res.cookie('token', token, { ...COOKIE_OPTIONS, maxAge: COOKIE_MAX_AGE });
        user.password = undefined;
        return res.status(200).json({
            message: 'Login Successfull',
            user: user,
            token: token,
            success: true,
        });
    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({ message: 'Something went wrong while signing you in. Please try again.' });
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

        const token = createToken(email, name, user.id);
        res.cookie('token', token, { ...COOKIE_OPTIONS, maxAge: COOKIE_MAX_AGE });

        // Best-effort welcome email — fire-and-forget so it never blocks signup.
        sendWelcome({ username: name, email });

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
        console.error('Check-auth error:', error.message);
        return res.status(500).json({ message: 'Could not verify your session. Please try again.' });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', COOKIE_OPTIONS);

        return res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error.message);
        return res.status(500).json({ message: 'Could not log you out. Please try again.' });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });

        // Only generate + send when the account exists, but always respond the
        // same way so the endpoint can't be used to discover registered emails.
        if (user) {
            const rawToken = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
            user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
            await user.save();

            const resetLink = `${CLIENT_URL}/reset-password?token=${rawToken}`;

            try {
                await sendPasswordReset(user, resetLink);
            } catch (mailErr) {
                console.error('Failed to send reset email:', mailErr.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'If an account exists for that email, a password reset link has been sent.',
        });
    } catch (error) {
        console.error('forgotPassword error:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
        if (!token || !password) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
        }

        // Setting password triggers the pre-save hook that bcrypt-hashes it.
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now sign in with your new password.',
        });
    } catch (error) {
        console.error('resetPassword error:', error.message);
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
