import Course from '../models/courseModel.js';
import User from '../models/userModel.js';
import Progress from '../models/progressModel.js';
import mongoose from 'mongoose';
const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    if (req.user.role !== 'Teacher') {
      return res.status(403).json({ error: 'Only teachers can create courses' });
    }
    const course = new Course({
      title: title.trim(),
      description: description.trim(),
      teacher: req.user.id,
    });
    await course.save();
    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { createdCourses: course._id } }
    );
    res.status(201).json({ course, message: 'Course created successfully' });
  } catch (err) {
    console.error('Create Course Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const getCourses = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Teacher') {
      query.teacher = req.user.id;
    } else if (req.user.role === 'Student') {
      query.students = req.user.id;
    }
    const courses = await Course.find(query)
      .populate('teacher', 'name')
      .populate('students', 'name');
    res.status(200).json({ courses });
  } catch (err) {
    console.error('Get Courses Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name')
      .populate('students', 'name')
      .populate('forums');
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (
      course.teacher._id.toString() !== req.user.id &&
      !course.students.some((s) => s._id.toString() === req.user.id)
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.status(200).json({ course });
  } catch (err) {
    console.error('Get Course Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the course teacher can update it' });
    }
    if (title?.trim()) course.title = title.trim();
    if (description?.trim()) course.description = description.trim();
    await course.save();
    res.status(200).json({ course, message: 'Course updated successfully' });
  } catch (err) {
    console.error('Update Course Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the course teacher can delete it' });
    }
    await course.deleteOne();
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { createdCourses: course._id } }
    );
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Delete Course Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const enrollStudent = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { studentIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the course teacher can enroll students' });
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'At least one student ID is required' });
    }

    const newStudentIds = studentIds.filter(studentId => !course.students.includes(studentId));
    if (newStudentIds.length === 0) {
      return res.status(400).json({ error: 'All selected students are already enrolled' });
    }

    course.students.push(...newStudentIds);
    await course.save();

    // Initialize progress for each new student
    await Promise.all(newStudentIds.map(async (studentId) => {
      const progress = await Progress.findOne({ course: courseId, student: studentId });
      if (!progress) {
        const newProgress = new Progress({
          course: courseId,
          student: studentId,
          progressPercentage: 0,
          completedMaterials: [],
          completedAssignments: [],
          completedQuizzes: [],
        });
        await newProgress.save();
      }
    }));

    res.status(200).json({ course, message: 'Students enrolled successfully' });
  } catch (err) {
    console.error('Enroll Student Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const uploadMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the course teacher can upload materials' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const material = {
      name: req.file.originalname,
      url: req.file.filename,
      type: req.file.mimetype === 'application/pdf' ? 'document' : req.file.mimetype === 'video/mp4' ? 'video' : 'link',
      uploadedAt: new Date(),
    };
    course.materials.push(material);
    await course.save();
    res.status(200).json({ course, message: 'Material uploaded successfully' });
  } catch (err) {
    console.error('Upload Material Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

export {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  uploadMaterial,
};