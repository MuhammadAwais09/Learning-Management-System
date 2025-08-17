// routes/goals.js
import express from 'express';
import {
  getGoals,
  createGoal,
  deleteGoal,
  updateGoal,
} from '../controllers/goalController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/goals - Fetch all goals for the authenticated user
router.get('/', authMiddleware, getGoals);

// POST /api/goals - Create a new goal
router.post('/', authMiddleware, createGoal);

// DELETE /api/goals/:id - Delete a specific goal
router.delete('/:id', authMiddleware, deleteGoal);

// PUT /api/goals/:id - Update a specific goal
router.put('/:id', authMiddleware, updateGoal);

export default router;