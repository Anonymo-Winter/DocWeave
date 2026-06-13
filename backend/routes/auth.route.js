import express from 'express';
import {
    login,
    register,
    checkAuth,
    logout,
    searchForEmail,
    forgotPassword,
    resetPassword,
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/verifytoken.js';
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/check-auth', verifyToken, checkAuth);
router.post('/search', searchForEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
