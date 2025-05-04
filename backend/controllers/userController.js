import axios from 'axios';
import User from '../model/User.js';
import Review from '../model/Review.js';

// Base URL removed from global scope per your request — full URL used per method

// Track recently viewed
export const trackRecentlyViewed = async (userId, countryCode) => {
  const user = await User.findById(userId);
  if (!user) return;

  // Remove if already exists
  user.recentlyViewed = user.recentlyViewed.filter(rv => rv.countryCode !== countryCode);

  // Add new at top
  user.recentlyViewed.unshift({
    countryCode,
    viewedAt: new Date(),
  });

  // Limit to last 10
  if (user.recentlyViewed.length > 10) {
    user.recentlyViewed = user.recentlyViewed.slice(0, 10);
  }

  await user.save();
};

/**
 * @desc Get recently viewed countries
 * @route GET /api/users/recently-viewed
 * @access Private
 */
export const getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const codes = user.recentlyViewed.map(item => item.countryCode);
    const response = await axios.get(`https://restcountries.com/v3.1/alpha?codes=${codes.join(',')}`);
    const countries = response.data;

    const reviewMap = {};
    const reviews = await Review.find({
      user: req.user.id,
      countryCode: { $in: codes }
    });

    reviews.forEach(r => {
      reviewMap[r.countryCode.toUpperCase()] = r.rating;
    });

    const enriched = user.recentlyViewed.map(item => {
      const country = countries.find(c => c.cca3 === item.countryCode || c.cca2 === item.countryCode);
      return {
        countryCode: item.countryCode,
        viewedAt: item.viewedAt,
        rating: reviewMap[item.countryCode] || null,
        name: country?.name?.common,
        flag: country?.flags?.png,
        region: country?.region,
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recently viewed countries', error: error.message });
  }
};

/**
 * @desc Update user profile (username, phone, profilePic)
 * @route PUT /api/users/profile
 * @access Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;

    // Check if new username/email already exists
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userId } },
        { $or: [{ username }, { email }] }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.username === username
          ? 'Username already in use'
          : 'Email already in use'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      error: 'Profile update failed',
      details: error.message
    });
  }
};

/**
 * @desc Reset password
 * @route PUT /api/users/reset-password
 * @access Private
 */
export const resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Current password is incorrect' 
      });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Invalidate existing tokens (optional security enhancement)
    // await Token.deleteMany({ userId: user._id });

    res.json({ 
      success: true,
      message: 'Password updated successfully',
      // Optionally include a new token if you want to force re-auth
      // token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Password reset failed',
      details: error.message 
    });
  }
};
/**
 * @desc Add or update a personal note for a country
 * @route POST /api/users/note
 * @access Private
 */
export const addOrUpdateNote = async (req, res) => {
  const { countryCode, note } = req.body;

  if (!countryCode || !note) {
    return res.status(400).json({ message: 'Country code and note are required' });
  }

  try {
    let review = await Review.findOne({ user: req.user.id, countryCode });

    if (review) {
      review.note = note;
    } else {
      review = new Review({ user: req.user.id, countryCode, note });
    }

    await review.save();
    res.status(200).json({ message: 'Note saved successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Error saving note', error: error.message });
  }
};

/**
 * @desc Get all notes added by the logged-in user
 * @route GET /api/users/notes
 * @access Private
 */
export const getUserNotes = async (req, res) => {
  try {
    const notes = await Review.find({ user: req.user.id, note: { $exists: true, $ne: '' } })
      .select('countryCode note createdAt');

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
};
