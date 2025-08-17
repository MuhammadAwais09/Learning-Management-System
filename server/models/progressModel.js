import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedMaterials: [{ type: mongoose.Schema.Types.ObjectId }],
  completedAssignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
  completedQuizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
  progressPercentage: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Progress', progressSchema);