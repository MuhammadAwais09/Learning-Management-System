import express from 'express';
import {
  createForum,
  getForumsByCourse,
  updateForum,
  deleteForum,
  addPost,
} from '../controllers/forumController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createForum);
router.get('/course/:courseId', authMiddleware, getForumsByCourse);
router.put('/:id', authMiddleware, updateForum);
router.delete('/:id', authMiddleware, deleteForum);
router.post('/:id/posts', authMiddleware, addPost);

export default router;