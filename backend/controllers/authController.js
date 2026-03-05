const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const allowedRoles = ['customer', 'shopowner'];
    const user = await User.create({ name, email, password, role: allowedRoles.includes(role) ? role : 'customer' });
    res.status(201).json({ token: generateToken(user._id), user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, loyaltyPoints: user.loyaltyPoints } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    if (user.isBanned)
      return res.status(403).json({ message: `Account banned: ${user.banReason}` });

    res.json({ token: generateToken(user._id), user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, loyaltyPoints: user.loyaltyPoints, language: user.language } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, language, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, address, language, avatar }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
