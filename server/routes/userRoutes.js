import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  updateNotificationPreferences,
  getStudents,
} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/password', authMiddleware, updatePassword);
router.put('/notifications', authMiddleware, updateNotificationPreferences);
router.get('/students', authMiddleware, getStudents);

export default router;