import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const user = new User({ email, password, name, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio, contactDetails, profilePicture } = req.body;
    const user = await User.findById(req.user._id);
    if (name?.trim()) user.name = name.trim();
    if (bio?.trim()) user.bio = bio.trim();
    if (contactDetails) user.contactDetails = contactDetails;
    if (profilePicture?.trim()) user.profilePicture = profilePicture.trim();
    await user.save();
    res.status(200).json({ user, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const updateNotificationPreferences = async (req, res) => {
  try {
    const { email, sms } = req.body;
    const user = await User.findById(req.user._id);
    user.notificationPreferences = { email: !!email, sms: !!sms };
    await user.save();
    res.status(200).json({ message: 'Notification preferences updated' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'Student' }).select('name _id');
    res.status(200).json({ students });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

export {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  updateNotificationPreferences,
  getStudents,
};