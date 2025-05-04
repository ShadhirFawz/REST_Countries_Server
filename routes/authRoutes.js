import express from 'express';
import { registerUser, loginUser, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route POST /api/auth/register
router.post('/register', registerUser);

// @route POST /api/auth/login
router.post('/login', loginUser);

// @route POST /api/auth/logout
router.post('/logout', logout);

router.get('/me', protect, getMe);

export default router;