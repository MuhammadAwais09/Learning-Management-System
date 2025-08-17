import express from 'express';
import {
  adminMiddleware,
  getTeachers,
  approveTeacher,
  rejectTeacher,
  addTeacher,
  getStudents,
  addStudent,
  getCourses,
  addCourse,
  getReports,
  getSettings,
  updateSettings,
  getUsers,
  approveUser,
  rejectUser,
  deactivateUser,
  deleteUser,
} from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authMiddleware and adminMiddleware to all routes
router.use(authMiddleware, adminMiddleware);

// Teacher management routes
router.get('/teachers', getTeachers);
router.put('/teachers/:id/approve', approveTeacher);
router.put('/teachers/:id/reject', rejectTeacher);
router.post('/teachers', addTeacher);

// Student management routes
router.get('/students', getStudents);
router.post('/students', addStudent);

// Course management routes
router.get('/courses', getCourses);
router.post('/courses', addCourse);

// Reports route
router.get('/reports', getReports);

// Settings routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// User management routes
router.get('/users', getUsers);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/reject', rejectUser);
router.put('/users/:id/deactivate', deactivateUser);
router.delete('/users/:id', deleteUser);

export default router;