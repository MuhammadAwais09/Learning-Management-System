// models/quizModel.js
import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true, trim: true },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
  }],
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [{ type: Number }],
    score: { type: Number },
    submittedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);