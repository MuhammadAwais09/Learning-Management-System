// In models/assignmentModel.js
import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  name: { type: String, required: true, trim: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submission: {
    fileUrl: { type: String },
    submittedAt: { type: Date },
  },
  graded: { type: Boolean, default: false },
  grade: { type: Number },
  feedback: { type: String, trim: true },
  dueDate: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model('Assignment', assignmentSchema);