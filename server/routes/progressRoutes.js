import express from 'express';
import {
  getStudentProgress,
  getProgressByCourse,
  updateProgress,
} from '../controllers/progressController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/student/:studentId/course/:courseId', authMiddleware, getStudentProgress);
router.get('/course/:courseId', authMiddleware, getProgressByCourse);
router.put('/student/:studentId/course/:courseId', authMiddleware, updateProgress);

export default router;