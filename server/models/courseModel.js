// models/courseModel.js
import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  materials: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['document', 'video', 'link'], required: true },
    uploadedAt: { type: Date, default: Date.now },
  }],
  forums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Forum' }],
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);