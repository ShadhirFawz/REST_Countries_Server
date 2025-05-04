import User from '../model/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user._id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body; // Add email to destructuring

    // Check if username OR email already exists
    const userExists = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (userExists) {
      return res.status(400).json({ 
        error: userExists.username === username 
          ? 'Username already exists' 
          : 'Email already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ 
      username, 
      email,    // Add email to user creation
      password: hashedPassword 
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
      expiresIn: '1d' 
    });

    res.status(201).json({ 
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/**
 * @desc    Login a user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body; // Accept both

    // Find by username OR email
    const user = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
      expiresIn: '1d' 
    });

    res.json({
      token,
      user: { 
        id: user._id, 
        username: user.username,
        email: user.email // Include email in response
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    User Logout
 * @route   GET /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  try {
    // Additional cleanup if needed
    // Example: await RevokedToken.create({ token: req.token });
    
    res.clearCookie('token');
    res.json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Logout failed',
      details: error.message 
    });
  }
};
