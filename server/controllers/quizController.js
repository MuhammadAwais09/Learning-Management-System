// controllers/quizController.js
import Quiz from '../models/quizModel.js';
import Course from '../models/courseModel.js';

const createQuiz = async (req, res) => {
  try {
    const { courseId, title, questions } = req.body;
    if (!courseId || !title?.trim() || !questions?.length) {
      return res.status(400).json({ error: 'Course ID, title, and questions are required' });
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
      questions,
    });
    await quiz.save();
    res.status(201).json({ quiz, message: 'Quiz created successfully' });
  } catch (err) {
    console.error('Create Quiz Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const getQuizzes = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (
      course.teacher.toString() !== req.user.id &&
      !course.students.includes(req.user.id)
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const quizzes = await Quiz.find({ course: req.params.courseId })
      .populate('course', 'title');
    res.status(200).json({ quizzes });
  } catch (err) {
    console.error('Get Quizzes Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    const course = await Course.findById(quiz.course);
    if (!course || !course.students.some(s => s.toString() === req.user.id)) {
      return res.status(403).json({ error: 'Only enrolled students can submit quizzes' });
    }
    const { answers } = req.body;
    if (!answers || answers.length !== quiz.questions.length) {
      return res.status(400).json({ error: 'Invalid answers' });
    }
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (q.correctAnswer === answers[i]) score++;
    });
    quiz.submissions.push({
      student: req.user.id,
      answers,
      score,
      submittedAt: new Date(),
    });
    await quiz.save();

    // Update progress
    let progress = await Progress.findOne({ course: quiz.course, student: req.user.id });
    if (!progress) {
      progress = new Progress({ course: quiz.course, student: req.user.id });
    }
    if (!progress.completedQuizzes.includes(req.params.id)) {
      progress.completedQuizzes.push(req.params.id);
      const totalItems = course.materials.length + (await Assignment.countDocuments({ course: quiz.course })) + (await Quiz.countDocuments({ course: quiz.course }));
      const completedItems = progress.completedMaterials.length + progress.completedAssignments.length + progress.completedQuizzes.length;
      progress.progressPercentage = totalItems ? (completedItems / totalItems) * 100 : 0;
      await progress.save();
    }

    res.status(200).json({ quiz, message: 'Quiz submitted successfully' });
  } catch (err) {
    console.error('Submit Quiz Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

export {
  createQuiz,
  getQuizzes,
  submitQuiz,
};