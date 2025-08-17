import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, List, ListItem, ListItemText, CircularProgress, MenuItem } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const StudentAssessmentGrading = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('learnify_token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) {
          throw new Error('Authentication token or user ID missing');
        }

        const [coursesRes, assignmentsRes, quizzesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/courses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/assignments/course/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/quizzes/course/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const fetchedCourses = Array.isArray(coursesRes.data.courses) ? coursesRes.data.courses : [];
        setCourses(fetchedCourses);
        setSelectedCourse(fetchedCourses.length > 0 ? fetchedCourses[0]._id : '');
        // Filter assignments to ensure they belong to the logged-in student
        setAssignments(
          Array.isArray(assignmentsRes.data.assignments)
            ? assignmentsRes.data.assignments.filter(a => a.student?._id === userId)
            : []
        );
        setQuizzes(Array.isArray(quizzesRes.data.quizzes) ? quizzesRes.data.quizzes : []);
        setLoading(false);
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load assessments';
        setError(errorMessage);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssignmentSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) throw new Error('Authentication token or user ID missing');

      // Verify the assignment belongs to the user
      const assignment = assignments.find(a => a._id === values.assignmentId);
      if (!assignment || assignment.student?._id !== userId) {
        throw new Error('You are not authorized to submit this assignment');
      }

      const formData = new FormData();
      formData.append('submission', values.file);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/assignments/${values.assignmentId}/submit`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      setAssignments(
        assignments.map((a) =>
          a._id === values.assignmentId
            ? { ...a, submission: response.data.assignment.submission }
            : a
        )
      );
      resetForm();
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to submit assignment';
      setError(errorMessage);
      console.error('Assignment Submission Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuizSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      if (!token) throw new Error('Authentication token missing');

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/quizzes/${values.quizId}/submit`,
        { answers: values.answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuizzes(
        quizzes.map((q) => (q._id === values.quizId ? response.data.quiz : q))
      );
      resetForm();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  if (error) return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography color="error" variant="h6">{error}</Typography>
      <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
        Retry
      </Button>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Assessment & Grading</Typography>
      {courses.length === 0 ? (
        <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
          No courses assigned to you
        </Typography>
      ) : (
        <>
          <TextField
            select
            label="Select Course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
            disabled={courses.length === 0}
          >
            {courses.map((course) => (
              <MenuItem key={course._id} value={course._id}>
                {course.title}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6">Assignments</Typography>
                <List>
                  {assignments.filter((a) => a.course?._id === selectedCourse).length > 0 ? (
                    assignments
                      .filter((a) => a.course?._id === selectedCourse)
                      .map((assignment) => (
                        <ListItem key={assignment._id}>
                          <ListItemText
                            primary={assignment.name || 'Unnamed Assignment'}
                            secondary={
                              assignment.submission?.submittedAt
                                ? `Submitted: ${new Date(
                                    assignment.submission.submittedAt
                                  ).toLocaleDateString()} | ${
                                    assignment.graded
                                      ? `Grade: ${assignment.grade} - ${assignment.feedback || 'No feedback'}`
                                      : 'Not graded'
                                  }`
                                : `Due: ${new Date(assignment.dueDate).toLocaleDateString()}`
                            }
                          />
                          {!assignment.submission?.submittedAt && (
                            <Formik
                              initialValues={{ assignmentId: assignment._id, file: null }}
                              validationSchema={Yup.object({
                                file: Yup.mixed()
                                  .required('File is required')
                                  .test('fileType', 'Only PDF or text files are allowed', 
                                    (value) => value && ['application/pdf', 'text/plain'].includes(value.type)),
                              })}
                              onSubmit={handleAssignmentSubmit}
                            >
                              {({ setFieldValue, errors, touched, isSubmitting }) => (
                                <Form>
                                  <input
                                    type="file"
                                    accept=".pdf,.txt"
                                    onChange={(e) => setFieldValue('file', e.target.files[0])}
                                  />
                                  {touched.file && errors.file && (
                                    <Typography color="error" variant="caption">
                                      {errors.file}
                                    </Typography>
                                  )}
                                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                                    Submit
                                  </Button>
                                </Form>
                              )}
                            </Formik>
                          )}
                        </ListItem>
                      ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No assignments for this course" />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6">Quizzes</Typography>
                <List>
                  {quizzes.filter((q) => q.course?._id === selectedCourse).length > 0 ? (
                    quizzes
                      .filter((q) => q.course?._id === selectedCourse)
                      .map((quiz) => {
                        const submission = quiz.submissions?.find(
                          (s) => s.student === localStorage.getItem('userId')
                        );
                        return (
                          <ListItem key={quiz._id}>
                            <ListItemText
                              primary={quiz.title || 'Unnamed Quiz'}
                              secondary={
                                submission
                                  ? `Score: ${submission.score}% - Submitted: ${new Date(
                                      submission.submittedAt
                                    ).toLocaleDateString()}`
                                  : 'Not attempted'
                              }
                            />
                            {!submission && (
                              <Formik
                                initialValues={{
                                  quizId: quiz._id,
                                  answers: quiz.questions?.map(() => 0) || [],
                                }}
                                validationSchema={Yup.object({
                                  answers: Yup.array().of(Yup.number().required('Answer is required')),
                                })}
                                onSubmit={handleQuizSubmit}
                              >
                                {({ setFieldValue, errors, touched, isSubmitting }) => (
                                  <Form>
                                    {quiz.questions?.length > 0 ? (
                                      quiz.questions.map((q, i) => (
                                        <Box key={i} sx={{ mb: 2 }}>
                                          <TextField
                                            select
                                            label={`Question ${i + 1}: ${q.question || 'Question'}`}
                                            onChange={(e) =>
                                              setFieldValue(`answers[${i}]`, parseInt(e.target.value))
                                            }
                                            fullWidth
                                            defaultValue={0}
                                          >
                                            {q.options?.length > 0 ? (
                                              q.options.map((opt, j) => (
                                                <MenuItem key={j} value={j}>
                                                  {opt}
                                                </MenuItem>
                                              ))
                                            ) : (
                                              <MenuItem value="" disabled>
                                                No options available
                                              </MenuItem>
                                            )}
                                          </TextField>
                                          {touched.answers?.[i] && errors.answers?.[i] && (
                                            <Typography color="error" variant="caption">
                                              {errors.answers[i]}
                                            </Typography>
                                          )}
                                        </Box>
                                      ))
                                    ) : (
                                      <Typography color="error" variant="caption">
                                        No questions available for this quiz
                                      </Typography>
                                    )}
                                    <Button
                                      type="submit"
                                      variant="contained"
                                      disabled={isSubmitting || !quiz.questions?.length}
                                    >
                                      Submit Quiz
                                    </Button>
                                  </Form>
                                )}
                              </Formik>
                            )}
                          </ListItem>
                        );
                      })
                  ) : (
                    <ListItem>
                      <ListItemText primary="No quizzes for this course" />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Box>
        </>
      )}
    </Box>
  );
};

export default StudentAssessmentGrading;