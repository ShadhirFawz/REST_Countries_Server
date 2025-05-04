// backend/routes/favorite.js
import express from 'express';
import { addFavorite, removeFavorite, getFavorites } from '../controllers/favoriteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getFavorites);
router.post('/', protect, addFavorite);
router.delete('/:code', protect, removeFavorite);

export default router;
