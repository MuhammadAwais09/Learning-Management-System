import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, LinearProgress, List, ListItem, ListItemText, TextField, Button, MenuItem, CircularProgress, IconButton } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const StudentProgressTracking = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [progress, setProgress] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('learnify_token');
        if (!token) throw new Error('No authentication token found');

        const [coursesRes, goalsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/courses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/goals`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const fetchedCourses = coursesRes.data.courses || [];
        setCourses(fetchedCourses);
        setSelectedCourse(fetchedCourses[0]?._id || '');
        setGoals(goalsRes.data.goals || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const fetchProgress = async () => {
        try {
          const token = localStorage.getItem('learnify_token');
          const userId = localStorage.getItem('userId');
          if (!token || !userId) throw new Error('No authentication token or user ID found');

          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/progress/student/${userId}/course/${selectedCourse}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setProgress(response.data.progress || null);
          setError(null);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to load progress');
        }
      };
      fetchProgress();
    } else {
      setProgress(null);
    }
  }, [selectedCourse]);

  const handleGoalSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      if (!token) throw new Error('No authentication token found');

      if (editingGoal) {
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/goals/${editingGoal._id}`,
          { description: values.description, targetDate: values.targetDate },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGoals(goals.map((g) => (g._id === editingGoal._id ? response.data.goal : g)));
        setEditingGoal(null);
      } else {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/goals`,
          { ...values, courseId: selectedCourse },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGoals([...goals, response.data.goal]);
      }
      resetForm();
      setSubmitting(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save goal');
      setSubmitting(false);
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const token = localStorage.getItem('learnify_token');
      if (!token) throw new Error('No authentication token found');

      await axios.delete(`${process.env.REACT_APP_API_URL}/goals/${goalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoals(goals.filter((g) => g._id !== goalId));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete goal');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Progress Tracking</Typography>
      {courses.length === 0 ? (
        <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
          No courses assigned to you
        </Typography>
      ) : (
        <TextField
          select
          label="Select Course"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        >
          {courses.map((course) => (
            <MenuItem key={course._id} value={course._id}>
              {course.title}
            </MenuItem>
          ))}
        </TextField>
      )}
      {selectedCourse && progress && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">
              Progress for {courses.find((c) => c._id === selectedCourse)?.title || 'Selected Course'}
            </Typography>
            <Typography>Progress: {progress.progressPercentage.toFixed(2)}%</Typography>
            <LinearProgress variant="determinate" value={progress.progressPercentage} sx={{ my: 2 }} />
            <Typography>Completed Materials: {progress.completedMaterials?.length || 0}</Typography>
            <Typography>Completed Assignments: {progress.completedAssignments?.length || 0}</Typography>
            <Typography>Completed Quizzes: {progress.completedQuizzes?.length || 0}</Typography>
          </CardContent>
        </Card>
      )}
      {selectedCourse && (
        <Card>
          <CardContent>
            <Typography variant="h6">{editingGoal ? 'Edit Learning Goal' : 'Set Learning Goal'}</Typography>
            <Formik
              initialValues={{
                description: editingGoal?.description || '',
                targetDate: editingGoal?.targetDate.split('T')[0] || '',
              }}
              enableReinitialize
              validationSchema={Yup.object({
                description: Yup.string().required('Goal description is required'),
                targetDate: Yup.date().required('Target date is required').min(new Date(), 'Target date must be in the future'),
              })}
              onSubmit={handleGoalSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <Field
                    as={TextField}
                    name="description"
                    label="Goal Description"
                    fullWidth
                    error={touched.description && !!errors.description}
                    helperText={touched.description && errors.description}
                    sx={{ mb: 2 }}
                  />
                  <Field
                    as={TextField}
                    name="targetDate"
                    label="Target Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={touched.targetDate && !!errors.targetDate}
                    helperText={touched.targetDate && errors.targetDate}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      {editingGoal ? 'Update Goal' : 'Set Goal'}
                    </Button>
                    {editingGoal && (
                      <Button
                        variant="outlined"
                        onClick={() => setEditingGoal(null)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </Form>
              )}
            </Formik>
            <Typography variant="h6" sx={{ mt: 2 }}>My Goals</Typography>
            <List>
              {goals.filter((g) => g.courseId === selectedCourse).length > 0 ? (
                goals
                  .filter((g) => g.courseId === selectedCourse)
                  .map((goal) => (
                    <ListItem
                      key={goal._id}
                      secondaryAction={
                        <Box>
                          <IconButton edge="end" onClick={() => handleEditGoal(goal)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" onClick={() => handleDeleteGoal(goal._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={goal.description}
                        secondary={`Target: ${new Date(goal.targetDate).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))
              ) : (
                <ListItem>
                  <ListItemText primary="No goals set for this course" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StudentProgressTracking;