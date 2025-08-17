import express from 'express';
import {
  createAssignment,
  getAssignments,
  submitAssignment,
  gradeAssignment,
  createQuiz,
} from '../controllers/assignmentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import Course from '../models/courseModel.js';
import Assignment from '../models/assignmentModel.js';
import Quiz from '../models/quizModel.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only PDF and text files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = express.Router();

router.post('/', authMiddleware, upload.single('file'), createAssignment);
router.get('/course/:courseId', authMiddleware, getAssignments);
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
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('student', 'name')
      .populate('course', 'title');
    res.status(200).json({ assignments });
  } catch (err) {
    console.error('Get All Assignments Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});
router.post('/:id/submit', authMiddleware, upload.single('submission'), submitAssignment);
router.put('/:id/grade', authMiddleware, gradeAssignment);
router.post('/quizzes', authMiddleware, createQuiz);

export default router;