import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  company: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Teacher', 'Student'], default: 'Student' },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Active', 'Inactive', 'Deactivated'],
    default: 'Active', // Changed to Active
  },
  qualification: { type: String, default: '' }, // For teachers
  contactDetails: {
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
  },
  bio: { type: String, default: '' },
  createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: [] }],
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: [] }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model('User', userSchema);