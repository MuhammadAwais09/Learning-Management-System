import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  MenuItem,
  Snackbar,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const TeacherAssessmentGrading = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('learnify_token');
        const coursesRes = await axios.get(`${process.env.REACT_APP_API_URL}/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(Array.isArray(coursesRes.data.courses) ? coursesRes.data.courses : []);
        setSelectedCourse(coursesRes.data.courses[0]?._id || '');
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load courses');
        setSnackbarMessage(err.response?.data?.error || 'Failed to load courses');
        setSnackbarOpen(true);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchAssignments();
      fetchQuizzes();
    }
  }, [selectedCourse]);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/assignments/course/${selectedCourse}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(Array.isArray(response.data.assignments) ? response.data.assignments.filter(a => a && a._id && a.name) : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load assignments');
      setSnackbarMessage(err.response?.data?.error || 'Failed to load assignments');
      setSnackbarOpen(true);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/quizzes/course/${selectedCourse}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes(Array.isArray(response.data.quizzes) ? response.data.quizzes.filter(q => q && q._id && q.title) : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load quizzes');
      setSnackbarMessage(err.response?.data?.error || 'Failed to load quizzes');
      setSnackbarOpen(true);
    }
  };

  const handleAssignmentCreate = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('dueDate', values.dueDate);
      formData.append('courseId', selectedCourse);
      if (values.file) formData.append('file', values.file);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/assignments`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      const newAssignments = Array.isArray(response.data.assignments) ? response.data.assignments.filter(a => a && a._id && a.name) : [];
      setAssignments([...assignments, ...newAssignments]);
      setSnackbarMessage('Assignment created successfully');
      setSnackbarOpen(true);
      resetForm();
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create assignment');
      setSnackbarMessage(err.response?.data?.error || 'Failed to create assignment');
      setSnackbarOpen(true);
      setSubmitting(false);
    }
  };

  const handleQuizCreate = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/quizzes`,
        { ...values, courseId: selectedCourse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newQuiz = response.data.quiz;
      if (newQuiz && newQuiz._id && newQuiz.title) {
        setQuizzes([...quizzes, newQuiz]);
        setSnackbarMessage('Quiz created successfully');
        setSnackbarOpen(true);
      }
      resetForm();
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create quiz');
      setSnackbarMessage(err.response?.data?.error || 'Failed to create quiz');
      setSnackbarOpen(true);
      setSubmitting(false);
    }
  };

  const handleGradeSubmit = async (values, { setSubmitting }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/assignments/${values.assignmentId}/grade`,
        { grade: values.grade, feedback: values.feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignments(assignments.map(a => a._id === values.assignmentId ? response.data.assignment : a));
      setSnackbarMessage('Assignment graded successfully');
      setSnackbarOpen(true);
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to grade assignment');
      setSnackbarMessage(err.response?.data?.error || 'Failed to grade assignment');
      setSnackbarOpen(true);
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (error && !courses.length) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Assessment & Grading</Typography>

      <TextField
        select
        label="Select Course"
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        fullWidth
        sx={{ mb: 4 }}
      >
        {courses.length ? (
          courses.map((course) => (
            <MenuItem key={course._id} value={course._id}>
              {course.title || 'Unnamed Course'}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No courses available</MenuItem>
        )}
      </TextField>

      {selectedCourse && (
        <Grid container spacing={4}>
          {/* Assignments Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Create Assignment</Typography>
                <Formik
                  initialValues={{ name: '', description: '', dueDate: '', file: null }}
                  validationSchema={Yup.object({
                    name: Yup.string().required('Name is required'),
                    description: Yup.string().required('Description is required'),
                    dueDate: Yup.date().required('Due date is required'),
                  })}
                  onSubmit={handleAssignmentCreate}
                >
                  {({ setFieldValue, errors, touched, isSubmitting }) => (
                    <Form>
                      <Field
                        as={TextField}
                        name="name"
                        label="Assignment Name"
                        fullWidth
                        error={touched.name && !!errors.name}
                        helperText={touched.name && errors.name}
                        sx={{ mb: 2 }}
                      />
                      <Field
                        as={TextField}
                        name="description"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        error={touched.description && !!errors.description}
                        helperText={touched.description && errors.description}
                        sx={{ mb: 2 }}
                      />
                      <Field
                        as={TextField}
                        name="dueDate"
                        type="date"
                        label="Due Date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        error={touched.dueDate && !!errors.dueDate}
                        helperText={touched.dueDate && errors.dueDate}
                        sx={{ mb: 2 }}
                      />
                      <input
                        type="file"
                        accept=".pdf,.txt"
                        onChange={(e) => setFieldValue('file', e.target.files[0])}
                        style={{ marginBottom: '16px' }}
                      />
                      <Button type="submit" variant="contained" disabled={isSubmitting}>
                        Create Assignment
                      </Button>
                    </Form>
                  )}
                </Formik>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6">Assignments</Typography>
                {assignments.length ? (
                  <List>
                    {assignments.map((assignment) => (
                      <ListItem key={assignment._id} alignItems="flex-start">
                        <ListItemText
                          primary={`${assignment.name} (${assignment.student?.name || 'Unknown'})`}
                          secondary={`Due: ${new Date(assignment.dueDate).toLocaleDateString()} | ${
                            assignment.graded ? `Grade: ${assignment.grade}` : 'Not graded'
                          }`}
                        />
                        {assignment.submission?.submittedAt && !assignment.graded && (
                          <Formik
                            initialValues={{ assignmentId: assignment._id, grade: '', feedback: '' }}
                            validationSchema={Yup.object({
                              grade: Yup.number().min(0).max(100).required('Grade is required'),
                              feedback: Yup.string(),
                            })}
                            onSubmit={handleGradeSubmit}
                          >
                            {({ errors, touched, isSubmitting }) => (
                              <Form style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <Field
                                  as={TextField}
                                  name="grade"
                                  label="Grade"
                                  type="number"
                                  size="small"
                                  error={touched.grade && !!errors.grade}
                                  helperText={touched.grade && errors.grade}
                                />
                                <Field
                                  as={TextField}
                                  name="feedback"
                                  label="Feedback"
                                  multiline
                                  rows={2}
                                  size="small"
                                />
                                <Button type="submit" variant="contained" size="small" disabled={isSubmitting}>
                                  Grade
                                </Button>
                              </Form>
                            )}
                          </Formik>
                        )}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography>No assignments available</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quizzes Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Create Quiz</Typography>
                <Formik
                  initialValues={{
                    title: '',
                    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
                  }}
                  validationSchema={Yup.object({
                    title: Yup.string().required('Title is required'),
                    questions: Yup.array().of(
                      Yup.object({
                        question: Yup.string().required('Question is required'),
                        options: Yup.array().of(Yup.string().required()).min(4).max(4),
                        correctAnswer: Yup.number().min(0).max(3).required('Correct answer required'),
                      })
                    ),
                  })}
                  onSubmit={handleQuizCreate}
                >
                  {({ values, setFieldValue, errors, touched, isSubmitting }) => (
                    <Form>
                      <Field
                        as={TextField}
                        name="title"
                        label="Quiz Title"
                        fullWidth
                        sx={{ mb: 2 }}
                      />
                      {values.questions.map((q, idx) => (
                        <Box key={idx} sx={{ mb: 2 }}>
                          <Field
                            as={TextField}
                            name={`questions[${idx}].question`}
                            label={`Question ${idx + 1}`}
                            fullWidth
                            sx={{ mb: 1 }}
                          />
                          {q.options.map((_, oIdx) => (
                            <Field
                              key={oIdx}
                              as={TextField}
                              name={`questions[${idx}].options[${oIdx}]`}
                              label={`Option ${oIdx + 1}`}
                              fullWidth
                              sx={{ mb: 1 }}
                            />
                          ))}
                          <Field
                            as={TextField}
                            select
                            name={`questions[${idx}].correctAnswer`}
                            label="Correct Answer"
                            fullWidth
                          >
                            {q.options.map((_, i) => (
                              <MenuItem key={i} value={i}>{`Option ${i + 1}`}</MenuItem>
                            ))}
                          </Field>
                        </Box>
                      ))}
                      <Button
                        variant="outlined"
                        onClick={() =>
                          setFieldValue('questions', [
                            ...values.questions,
                            { question: '', options: ['', '', '', ''], correctAnswer: 0 },
                          ])
                        }
                        sx={{ mb: 2 }}
                      >
                        Add Question
                      </Button>
                      <Button type="submit" variant="contained" disabled={isSubmitting}>
                        Create Quiz
                      </Button>
                    </Form>
                  )}
                </Formik>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6">Quizzes</Typography>
                {quizzes.length ? (
                  <List>
                    {quizzes.map((quiz) => (
                      <ListItem key={quiz._id}>
                        <ListItemText
                          primary={quiz.title}
                          secondary={`Questions: ${quiz.questions?.length || 0} | Submissions: ${quiz.submissions?.length || 0}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography>No quizzes available</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarMessage.includes('Failed') ? 'error' : 'success'}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Error Boundary Wrapper
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <Typography color="error">Something went wrong: {this.state.error.message}</Typography>;
    }
    return this.props.children;
  }
}

export default () => (
  <ErrorBoundary>
    <TeacherAssessmentGrading />
  </ErrorBoundary>
);
