import User from '../models/userModel.js';
import Course from '../models/courseModel.js';
import Progress from '../models/progressModel.js';
import Assignment from '../models/assignmentModel.js';
import Quiz from '../models/quizModel.js';
import mongoose from 'mongoose';
import courseModel from '../models/courseModel.js';

// Middleware to restrict access to Admins
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied: Admins only' });
  }
  next();
};

// Get all teachers with course titles
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'Teacher' })
      .select('name email contactDetails qualification status createdCourses')
      .populate('createdCourses', 'title');
    res.status(200).json({ teachers });
  } catch (err) {
    console.error('Get Teachers Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Approve a teacher
const approveTeacher = async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== 'Teacher') {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    teacher.status = 'Approved';
    await teacher.save();
    res.status(200).json({ teacher, message: 'Teacher approved successfully' });
  } catch (err) {
    console.error('Approve Teacher Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Reject a teacher
const rejectTeacher = async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== 'Teacher') {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    teacher.status = 'Rejected';
    await teacher.save();
    res.status(200).json({ teacher, message: 'Teacher rejected successfully' });
  } catch (err) {
    console.error('Reject Teacher Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Add a new teacher
const addTeacher = async (req, res) => {
  try {
    const { name, email, password, qualification } = req.body;
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const teacher = new User({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      role: 'Teacher',
      status: 'Pending',
      qualification: qualification?.trim() || '',
      company: '',
      contactDetails: { phone: '', address: '' },
      notificationPreferences: { email: true, sms: false },
      bio: '',
      createdCourses: [],
      enrolledCourses: [],
    });
    await teacher.save();
    res.status(201).json({ teacher, message: 'Teacher added successfully' });
  } catch (err) {
    console.error('Add Teacher Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Get all students with enrolled course count
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'Student' }).select('name email status');
    const studentsWithCourses = await Promise.all(
      students.map(async (student) => {
        const enrolledCourses = await Course.countDocuments({ students: student._id });
        return { ...student.toObject(), enrolledCourses };
      })
    );
    res.status(200).json({ students: studentsWithCourses });
  } catch (err) {
    console.error('Get Students Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Add a new student
const addStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const student = new User({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      role: 'Student',
      company: '',
      contactDetails: { phone: '', address: '' },
      notificationPreferences: { email: true, sms: false },
      bio: '',
      createdCourses: [],
      enrolledCourses: [],
    });
    await student.save();
    res.status(201).json({ student, message: 'Student added successfully' });
  } catch (err) {
    console.error('Add Student Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Get all courses with student enrollment count
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().select('title students');
    const coursesWithStats = courses.map((course) => ({
      ...course.toObject(),
      studentsEnrolled: course.students.length,
    }));
    res.status(200).json({ courses: coursesWithStats });
  } catch (err) {
    console.error('Get Courses Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Add a new course
const addCourse = async (req, res) => {
  try {
    const { title, description, teacherId } = req.body;
    if (!title?.trim() || !teacherId) {
      return res.status(400).json({ error: 'Title and teacher ID are required' });
    }
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'Teacher' || teacher.status !== 'Approved') {
      return res.status(400).json({ error: 'Invalid or unapproved teacher' });
    }
    const course = new Course({
      title: title.trim(),
      description: description?.trim() || '',
      teacher: teacherId,
      students: [],
    });
    await course.save();
    res.status(201).json({ course, message: 'Course created successfully' });
  } catch (err) {
    console.error('Add Course Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Get reports (student progress, teacher performance, course completion, system usage)
const getReports = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'Student' });
    const totalTeachers = await User.countDocuments({ role: 'Teacher' });
    const totalCourses = await Course.countDocuments();

    const progressData = await Progress.aggregate([
      {
        $group: {
          _id: null,
          completed: { $sum: { $cond: [{ $gte: ['$progressPercentage', 100] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $and: [{ $gt: ['$progressPercentage', 0] }, { $lt: ['$progressPercentage', 100] }] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$progressPercentage', 0] }, 1, 0] } },
        },
      },
    ]);

    const teacherPerformance = await Course.aggregate([
      { $group: { _id: '$teacher', courseCount: { $sum: 1 } } },
      {
        $project: {
          highPerformance: { $cond: [{ $gte: ['$courseCount', 5] }, 1, 0] },
          averagePerformance: { $cond: [{ $and: [{ $gte: ['$courseCount', 2] }, { $lt: ['$courseCount', 5] }] }, 1, 0] },
          lowPerformance: { $cond: [{ $lt: ['$courseCount', 2] }, 1, 0] },
        },
      },
      {
        $group: {
          _id: null,
          highPerformance: { $sum: '$highPerformance' },
          averagePerformance: { $sum: '$averagePerformance' },
          lowPerformance: { $sum: '$lowPerformance' },
        },
      },
    ]);

    const courseCompletion = await Progress.aggregate([
      {
        $group: {
          _id: '$course',
          completed: { $sum: { $cond: [{ $gte: ['$progressPercentage', 100] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $lt: ['$progressPercentage', 100] }, 1, 0] } },
        },
      },
      {
        $group: {
          _id: null,
          completed: { $sum: '$completed' },
          pending: { $sum: '$pending' },
        },
      },
    ]);

    const systemUsage = {
      activeUsers: await User.countDocuments({ status: 'Active' }),
      inactiveUsers: await User.countDocuments({ status: 'Inactive' }),
      totalLogins: 0, // Placeholder (requires login tracking table)
    };

    res.status(200).json({
      reports: {
        studentProgress: {
          totalStudents,
          completed: progressData[0]?.completed || 0,
          inProgress: progressData[0]?.inProgress || 0,
          failed: progressData[0]?.failed || 0,
        },
        teacherPerformance: {
          totalTeachers,
          highPerformance: teacherPerformance[0]?.highPerformance || 0,
          averagePerformance: teacherPerformance[0]?.averagePerformance || 0,
          lowPerformance: teacherPerformance[0]?.lowPerformance || 0,
        },
        courseCompletion: {
          totalCourses,
          completed: courseCompletion[0]?.completed || 0,
          pending: courseCompletion[0]?.pending || 0,
        },
        systemUsage,
      },
    });
  } catch (err) {
    console.error('Get Reports Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Get system settings
const getSettings = async (req, res) => {
  try {
    const settings = {
      notificationSettings: 'email',
      paymentGateway: 'paypal',
      userRole: 'admin',
      apiKey: '',
    };
    res.status(200).json({ settings });
  } catch (err) {
    console.error('Get Settings Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Update system settings
const updateSettings = async (req, res) => {
  try {
    const { notificationSettings, paymentGateway, userRole, apiKey } = req.body;
    const settings = {
      notificationSettings: notificationSettings || 'email',
      paymentGateway: paymentGateway || 'paypal',
      userRole: userRole || 'admin',
      apiKey: apiKey || '',
    };
    res.status(200).json({ settings, message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Update Settings Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Get all users (exclude Deactivated users)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ status: { $ne: 'Deactivated' } }).select('name email role status');
    res.status(200).json({ users });
  } catch (err) {
    console.error('Get Users Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Approve a user
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.status = 'Active';
    await user.save();
    res.status(200).json({ user, message: 'User approved successfully' });
  } catch (err) {
    console.error('Approve User Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Reject a user
const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.status = 'Inactive';
    await user.save();
    res.status(200).json({ user, message: 'User rejected successfully' });
  } catch (err) {
    console.error('Reject User Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Deactivate a user
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.status = 'Deactivated';
    await user.save();
    res.status(200).json({ user, message: 'User deactivated successfully' });
  } catch (err) {
    console.error('Deactivate User Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete User Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

export {
  adminMiddleware,
  getTeachers,
  approveTeacher,
  rejectTeacher,
  addTeacher,
  getStudents,
  addStudent,
  getCourses,
  addCourse,
  getReports,
  getSettings,
  updateSettings,
  getUsers,
  approveUser,
  rejectUser,
  deactivateUser,
  deleteUser,
};