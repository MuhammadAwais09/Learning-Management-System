// controllers/goalController.js
import Goal from '../models/Goal.js';

// Get all goals for the authenticated user
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id });
    res.json({ goals });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new goal
export const createGoal = async (req, res) => {
  const { description, targetDate, courseId } = req.body;
  try {
    const goal = new Goal({
      description,
      targetDate,
      courseId,
      userId: req.user.id,
    });
    await goal.save();
    res.status(201).json({ goal });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create goal' });
  }
};

// Delete a specific goal
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a specific goal
export const updateGoal = async (req, res) => {
  const { description, targetDate } = req.body;
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { description, targetDate },
      { new: true }
    );
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json({ goal });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update goal' });
  }
};