import express from 'express';
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  uploadMaterial,
} from '../controllers/courseController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'video/mp4', 'text/plain'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only PDF, MP4, and text files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = express.Router();

router.post('/', authMiddleware, createCourse);
router.get('/', authMiddleware, getCourses);
router.get('/:id', authMiddleware, getCourse);
router.put('/:id', authMiddleware, updateCourse);
router.delete('/:id', authMiddleware, deleteCourse);
router.post('/:id/enroll', authMiddleware, enrollStudent);
router.post('/:id/materials', authMiddleware, upload.single('material'), uploadMaterial);

// New route to serve files
router.get('/Uploads/:filename', authMiddleware, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../Uploads', filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(500).json({ error: 'Failed to send file' });
      }
    });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;