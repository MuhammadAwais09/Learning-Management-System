import Assignment from '../models/assignmentModel.js';
import Course from '../models/courseModel.js';
import Progress from '../models/progressModel.js';
import Quiz from '../models/quizModel.js';
import mongoose from 'mongoose';

const createAssignment = async (req, res) => {
  try {
    const { courseId, name, dueDate, description } = req.body;
    if (!courseId || !name?.trim() || !dueDate) {
      return res.status(400).json({ error: 'Course ID, name, and due date are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }
    const course = await Course.findById(courseId).populate('students', 'name email');
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the course teacher can create assignments' });
    }
    const assignments = await Promise.all(
      course.students.map(async (student) => {
        const assignment = new Assignment({
          course: courseId,
          name: name.trim(),
          description: description?.trim() || '',
          student: student._id,
          dueDate: new Date(dueDate),
          fileUrl: req.file ? req.file.filename : null,
        });
        await assignment.save();
        return assignment.populate('student', 'name email').populate('course', 'title').then(doc => doc.toObject());
      })
    );
    res.status(201).json({ assignments, message: 'Assignments created successfully' });
  } catch (err) {
    console.error('Create Assignment Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const getAssignments = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    if (courseId === 'all') {
      let query = {};
      if (req.user.role === 'Teacher') {
        const courses = await Course.find({ teacher: req.user.id }).select('_id');
        const courseIds = courses.map(course => course._id);
        query = { course: { $in: courseIds } };
      } else if (req.user.role === 'Student') {
        const courses = await Course.find({ students: req.user.id }).select('_id');
        const courseIds = courses.map(course => course._id);
        query = { course: { $in: courseIds }, student: req.user.id };
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }

      const assignments = await Assignment.find(query)
        .populate('student', 'name email')
        .populate('course', 'title');
      return res.status(200).json({ assignments });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (
      course.teacher.toString() !== req.user.id &&
      !course.students.some(s => s && s.toString() === req.user.id)
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let query = { course: courseId };
    if (req.user.role === 'Student') {
      query.student = req.user.id;
    }

    const assignments = await Assignment.find(query)
      .populate('student', 'name email')
      .populate('course', 'title');
    res.status(200).json({ assignments });
  } catch (err) {
    console.error('Get Assignments Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    if (assignment.student.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the assigned student can submit' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    assignment.submission = {
      fileUrl: req.file.filename,
      submittedAt: new Date(),
    };
    await assignment.save();

    // Update progress
    let progress = await Progress.findOne({ course: assignment.course, student: req.user.id });
    if (!progress) {
      progress = new Progress({ course: assignment.course, student: req.user.id });
    }
    if (!progress.completedAssignments.includes(req.params.id)) {
      progress.completedAssignments.push(req.params.id);
      const course = await Course.findById(assignment.course);
      const totalItems = course.materials.length + (await Assignment.countDocuments({ course: assignment.course })) + (await Quiz.countDocuments({ course: assignment.course }));
      const completedItems = progress.completedMaterials.length + progress.completedAssignments.length + progress.completedQuizzes.length;
      progress.progressPercentage = totalItems ? (completedItems / totalItems) * 100 : 0;
      await progress.save();
    }

    const populatedAssignment = await assignment
      .populate({
        path: 'student',
        select: 'name email'
      })
      .populate({
        path: 'course',
        select: 'title'
      });
    res.status(200).json({ assignment: populatedAssignment, message: 'Assignment submitted successfully' });
  } catch (err) {
    console.error('Submit Assignment Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const gradeAssignment = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    const course = await Course.findById(assignment.course);
    if (!course || course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the course teacher can grade assignments' });
    }
    if (grade === undefined || isNaN(grade) || grade < 0 || grade > 100) {
      return res.status(400).json({ error: 'Valid grade (0-100) is required' });
    }
    assignment.grade = grade;
    assignment.feedback = feedback?.trim() || '';
    assignment.graded = true;
    await assignment.save();
    const populatedAssignment = await assignment.populate('student', 'name email').populate('course', 'title');
    res.status(200).json({ assignment: populatedAssignment, message: 'Assignment graded successfully' });
  } catch (err) {
    console.error('Grade Assignment Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const createQuiz = async (req, res) => {
  try {
    const { courseId, title, questions } = req.body;
    if (!courseId || !title?.trim() || !questions?.length) {
      return res.status(400).json({ error: 'Course ID, title, and at least one question are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the course teacher can create quizzes' });
    }
    const quiz = new Quiz({
      course: courseId,
      title: title.trim(),
      questions: questions.map(q => ({
        question: q.question?.trim(),
        options: q.options.map(o => o?.trim()),
        correctAnswer: q.correctAnswer,
      })),
    });
    await quiz.save();
    const populatedQuiz = await quiz.populate('course', 'title');
    res.status(201).json({ quiz: populatedQuiz, message: 'Quiz created successfully' });
  } catch (err) {
    console.error('Create Quiz Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

export {
  createAssignment,
  getAssignments,
  submitAssignment,
  gradeAssignment,
  createQuiz,
};