import mongoose from 'mongoose';

const forumSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500 },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  posts: [{
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

export default mongoose.model('Forum', forumSchema);