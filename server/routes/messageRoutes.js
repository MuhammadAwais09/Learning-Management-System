import express from 'express';
import {
  sendMessage,
  sendAnnouncement,
  getMessages,
} from '../controllers/messageController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send', authMiddleware, sendMessage);
router.post('/announcement', authMiddleware, sendAnnouncement);
router.get('/', authMiddleware, getMessages);

export default router;