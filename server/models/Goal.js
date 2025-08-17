// models/Goal.js
import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  description: { type: String, required: true },
  targetDate: { type: Date, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;