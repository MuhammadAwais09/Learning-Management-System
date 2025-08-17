import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true, trim: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  isAnnouncement: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);