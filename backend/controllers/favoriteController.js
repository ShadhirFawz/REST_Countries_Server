// backend/controllers/favoriteController.js
import User from '../model/User.js';

/**
 * @desc Add a country to favorites
 * @route POST /api/favorites
 * @access Private
 */
export const addFavorite = async (req, res) => {
  const userId = req.user._id;
  const { code, name, flag } = req.body;

  try {
    const user = await User.findById(userId);
    const alreadyExists = user.favorites.find(c => c.code === code);
    if (alreadyExists) {
      return res.status(400).json({ message: 'Country already in favorites' });
    }

    user.favorites.push({ code, name, flag });
    await user.save();
    res.status(200).json({ message: 'Added to favorites', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: 'Error adding favorite', error: err.message });
  }
};

/**
 * @desc Remove a country from favorites
 * @route DELETE /api/favorites/:code
 * @access Private
 */
export const removeFavorite = async (req, res) => {
  const userId = req.user._id;
  const { code } = req.params;

  try {
    const user = await User.findById(userId);
    user.favorites = user.favorites.filter(c => c.code !== code);
    await user.save();
    res.status(200).json({ message: 'Removed from favorites', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: 'Error removing favorite', error: err.message });
  }
};

/**
 * @desc Get all favorite countries
 * @route GET /api/favorites
 * @access Private
 */
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('favorites');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user.favorites);
  } catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ 
      message: 'Error fetching favorites', 
      error: err.message 
    });
  }
};
