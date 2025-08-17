import Progress from '../models/progressModel.js';
import Course from '../models/courseModel.js';
import Assignment from '../models/assignmentModel.js';
import Quiz from '../models/quizModel.js';
import mongoose from 'mongoose';

const getStudentProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (
      course.teacher.toString() !== req.user.id &&
      req.user.id !== studentId
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }
    let progress = await Progress.findOne({ student: studentId, course: courseId })
      .populate('student', 'name email')
      .populate('course', 'title')
      .populate('completedMaterials', 'title')
      .populate('completedAssignments', 'name')
      .populate('completedQuizzes', 'title');
    if (!progress) {
      progress = new Progress({ student: studentId, course: courseId });
      await progress.save();
    }
    res.status(200).json({ progress });
  } catch (err) {
    console.error('Get Progress Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const getProgressByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the course teacher can view progress' });
    }
    const progress = await Progress.find({ course: courseId })
      .populate('student', 'name email')
      .populate('course', 'title')
      .populate('completedMaterials', 'title')
      .populate('completedAssignments', 'name')
      .populate('completedQuizzes', 'title');
    res.status(200).json({ progress });
  } catch (err) {
    console.error('Get Course Progress Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { completedMaterialId, completedAssignmentId, completedQuizId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (
      course.teacher.toString() !== req.user.id &&
      req.user.id !== studentId
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }
    let progress = await Progress.findOne({ student: studentId, course: courseId });
    if (!progress) {
      progress = new Progress({ student: studentId, course: courseId });
    }
    if (completedMaterialId && course.materials.some(m => m._id.toString() === completedMaterialId)) {
      progress.completedMaterials.push(completedMaterialId);
    }
    if (completedAssignmentId) {
      const assignment = await Assignment.findById(completedAssignmentId);
      if (assignment && assignment.student.toString() === studentId) {
        progress.completedAssignments.push(completedAssignmentId);
      }
    }
    if (completedQuizId) {
      const quiz = await Quiz.findById(completedQuizId);
      if (quiz && quiz.submissions.some(s => s.student.toString() === studentId)) {
        progress.completedQuizzes.push(completedQuizId);
      }
    }
    const totalItems = course.materials.length + (await Assignment.countDocuments({ course: courseId })) + (await Quiz.countDocuments({ course: courseId }));
    const completedItems = progress.completedMaterials.length + progress.completedAssignments.length + progress.completedQuizzes.length;
    progress.progressPercentage = totalItems ? (completedItems / totalItems) * 100 : 0;
    await progress.save();
    res.status(200).json({ progress, message: 'Progress updated successfully' });
  } catch (err) {
    console.error('Update Progress Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

export {
  getStudentProgress,
  getProgressByCourse,
  updateProgress,
};