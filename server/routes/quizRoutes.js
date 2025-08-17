import express from 'express';
import {
  createQuiz,
  getQuizzes,
  submitQuiz,
} from '../controllers/quizController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Course from '../models/courseModel.js';
import Quiz from '../models/quizModel.js';

const router = express.Router();

router.post('/', authMiddleware, createQuiz);
router.get('/course/all', authMiddleware, async (req, res) => {
  try {
    let courseIds;
    if (req.user.role === 'Teacher') {
      const courses = await Course.find({ teacher: req.user.id }).select('_id');
      courseIds = courses.map((course) => course._id);
    } else if (req.user.role === 'Student') {
      const courses = await Course.find({ students: req.user.id }).select('_id');
      courseIds = courses.map((course) => course._id);
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
    const quizzes = await Quiz.find({ course: { $in: courseIds } }).populate('course', 'title');
    res.status(200).json({ quizzes });
  } catch (err) {
    console.error('Get All Quizzes Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});
router.get('/course/:courseId', authMiddleware, getQuizzes);
router.post('/:id/submit', authMiddleware, submitQuiz);

export default router;