import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, LinearProgress, TextField, MenuItem, CircularProgress } from '@mui/material';
import axios from 'axios';

const TeacherProgressTracking = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [classStats, setClassStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('learnify_token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const courses = Array.isArray(response.data.courses) ? response.data.courses.filter(c => c && c._id && c.title) : [];
        setCourses(courses);
        setSelectedCourse(courses[0]?._id || '');
        setLoading(false);
      } catch (err) {
        console.error('Fetch Courses Error:', err);
        setError(err.response?.data?.error || 'Failed to load courses');
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
          const [courseRes, progressRes] = await Promise.all([
            axios.get(`${process.env.REACT_APP_API_URL}/courses/${selectedCourse}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${process.env.REACT_APP_API_URL}/progress/course/${selectedCourse}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          setStudents(Array.isArray(courseRes.data.course.students) ? courseRes.data.course.students : []);
          const progress = Array.isArray(progressRes.data.progress) ? progressRes.data.progress.filter(p => p && p.student && p.student._id) : [];
          setProgressData(progress);
          setClassStats({
            averageProgress: progress.length
              ? (progress.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / progress.length).toFixed(2)
              : 0,
            strugglingStudents: progress.filter(p => (p.progressPercentage || 0) < 50).length,
          });
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to load progress');
        }
      };
      fetchProgress();
    }
  }, [selectedCourse]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Progress Tracking</Typography>
      <TextField
        select
        label="Select Course"
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
      >
        {courses.length ? (
          courses.map((course) => (
            <MenuItem key={course._id} value={course._id}>{course.title || 'Unnamed Course'}</MenuItem>
          ))
        ) : (
          <MenuItem disabled>No courses available</MenuItem>
        )}
      </TextField>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Class Performance</Typography>
          <Typography>Average Progress: {classStats?.averageProgress || 0}%</Typography>
          <Typography>Struggling Students: {classStats?.strugglingStudents || 0}</Typography>
        </CardContent>
      </Card>
      <Typography variant="h5" gutterBottom>
        Student Progress for {courses.find(c => c._id === selectedCourse)?.title || 'Selected Course'}
      </Typography>
      {progressData.length ? progressData.map((progress) => (
        <Card key={progress.student._id} sx={{ mb: 2, border: (progress.progressPercentage || 0) < 50 ? '2px solid red' : 'none' }}>
          <CardContent>
            <Typography variant="h6">{progress.student?.name || 'Unknown Student'}</Typography>
            <Typography>Progress: {(progress.progressPercentage || 0).toFixed(2)}%</Typography>
            <LinearProgress variant="determinate" value={progress.progressPercentage || 0} sx={{ my: 2 }} />
            <Typography>Completed Materials: {progress.completedMaterials?.length || 0}</Typography>
            <Typography>Completed Assignments: {progress.completedAssignments?.length || 0}</Typography>
            <Typography>Completed Quizzes: {progress.completedQuizzes?.length || 0}</Typography>
            {(progress.progressPercentage || 0) < 50 && (
              <Typography color="error">This student may need additional support</Typography>
            )}
          </CardContent>
        </Card>
      )) : <Typography>No student progress data available</Typography>}
    </Box>
  );
};

export default TeacherProgressTracking;