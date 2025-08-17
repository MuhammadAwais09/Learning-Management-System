import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Chip,
  Grid,
  Tooltip,
  Container,
  Divider,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  School,
  Assignment,
  Notifications,
  Assessment,
  Forum,
  BarChart,
  Group,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for new sections (replace with backend endpoints if available)
  const recentActivity = [
    { id: 1, type: 'Grading', description: 'Graded Assignment: Math Homework', date: new Date().toLocaleDateString('en-PK') },
    { id: 2, type: 'Announcement', description: 'Posted Announcement: Exam Schedule', date: new Date().toLocaleDateString('en-PK') },
    { id: 3, type: 'Course', description: 'Updated Course: Physics Syllabus', date: new Date().toLocaleDateString('en-PK') },
  ];

  const studentPerformance = courses.length
    ? courses.map((course, index) => ({
        id: index + 1,
        courseId: course._id,
        courseTitle: course.title || 'Unnamed Course',
        averageGrade: Math.floor(Math.random() * (95 - 70) + 70), // Mocked, replace with /grades
        studentsEnrolled: course.students?.length || 0,
      }))
    : [];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('learnify_token');
        if (!token || !userId) {
          throw new Error('Authentication token or user ID missing');
        }
        const [coursesRes, submissionsRes, messagesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/courses`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { teacher: userId },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/assignments/course/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { isAnnouncement: true, sender: userId },
          }),
        ]);

        const fetchedCourses = Array.isArray(coursesRes.data.courses) ? coursesRes.data.courses : [];
        const fetchedSubmissions = Array.isArray(submissionsRes.data.assignments)
          ? submissionsRes.data.assignments
              .filter(a => a.submission?.submittedAt && !a.submission.graded && a.course?.teacher === userId)
              .slice(0, 5)
          : [];
        const fetchedMessages = Array.isArray(messagesRes.data.messages)
          ? messagesRes.data.messages.slice(0, 5)
          : [];

        setCourses(fetchedCourses);
        setSubmissions(fetchedSubmissions);
        setMessages(fetchedMessages);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load dashboard');
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  if (error) return (
    <Container maxWidth="lg">
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          sx={{ mt: 2, borderRadius: 2 }}
          aria-label="Retry loading dashboard"
        >
          Retry
        </Button>
      </Box>
    </Container>
  );

  if (courses.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Card sx={{ mb: 3, bgcolor: 'linear-gradient(45deg, #1e3a8a 30%, #3b82f6 90%)', color: '#000000', borderRadius: 2, boxShadow: 4 }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  Welcome, {localStorage.getItem('userName') || 'Teacher'}!
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  No courses assigned to you. Start by creating or managing your courses!
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Shape the future, one lesson at a time!
                </Typography>
              </CardContent>
            </Card>
            <Button
              component={Link}
              to="/teacher/courses"
              variant="contained"
              color="primary"
              startIcon={<School />}
              sx={{ borderRadius: 2, px: 3 }}
              aria-label="Manage courses"
            >
              Manage Courses
            </Button>
          </motion.div>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Card sx={{ mb: 3, bgcolor: 'linear-gradient(45deg, #1e3a8a 30%, #3b82f6 90%)', color: '#000000', borderRadius: 2, boxShadow: 4 }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                Welcome, {localStorage.getItem('userName') || 'Teacher'}!
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                You’re teaching {courses.length} course{courses.length !== 1 ? 's' : ''} with {submissions.length} pending grading{submissions.length !== 1 ? 's' : ''} and {messages.length} recent announcement{messages.length !== 1 ? 's' : ''}.
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Keep shaping the future, one lesson at a time!
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: 5 },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2, fontWeight: 'medium' }}>
                    <School sx={{ mr: 1, color: 'primary.main' }} /> My Courses
                  </Typography>
                  <List dense>
                    {courses.length ? courses.map((course) => (
                      <ListItem key={course._id} sx={{ borderRadius: 1, mb: 1, p: 1 }}>
                        <ListItemText
                          primary={
                            <Link
                              to={`/teacher/courses/${course._id}`}
                              style={{ textDecoration: 'none', color: 'primary.main' }}
                            >
                              {course.title || 'Unnamed Course'}
                            </Link>
                          }
                          secondary={`Students: ${course.students?.length || 0}`}
                        />
                      </ListItem>
                    )) : <ListItem><ListItemText primary="No courses assigned" /></ListItem>}
                  </List>
                  <Button
                    component={Link}
                    to="/teacher/course-management"
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 1, borderRadius: 2 }}
                    aria-label="Manage all courses"
                  >
                    Manage Courses
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: 5 },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2, fontWeight: 'medium' }}>
                    <Assignment sx={{ mr: 1, color: 'primary.main' }} /> Pending Submissions
                  </Typography>
                  <List dense>
                    {submissions.length ? submissions.map((submission) => (
                      <ListItem
                        key={submission._id}
                        secondaryAction={
                          <Tooltip title="Grade this submission">
                            <Button
                              component={Link}
                              to="/teacher/assessment-grading"
                              variant="outlined"
                              color="primary"
                              size="small"
                              aria-label={`Grade submission ${submission.name || 'Unnamed Submission'}`}
                            >
                              Grade Now
                            </Button>
                          </Tooltip>
                        }
                        sx={{ borderRadius: 1, mb: 1, p: 1 }}
                      >
                        <ListItemText
                          primary={submission.name || 'Unnamed Submission'}
                          secondary={`Student: ${submission.submission?.student?.name || 'Unknown'} - Course: ${submission.course?.title || 'Unknown'}`}
                        />
                      </ListItem>
                    )) : <ListItem><ListItemText primary="No pending submissions" /></ListItem>}
                  </List>
                  {submissions.length >= 5 && (
                    <Button
                      component={Link}
                      to="/teacher/assessment-grading"
                      variant="outlined"
                      color="primary"
                      sx={{ mt: 1, borderRadius: 2 }}
                      aria-label="View all submissions"
                    >
                      View All
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: 5 },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2, fontWeight: 'medium' }}>
                    <Notifications sx={{ mr: 1, color: 'primary.main' }} /> Recent Announcements
                  </Typography>
                  <List dense>
                    {messages.length ? messages.map((message) => (
                      <ListItem
                        key={message._id}
                        sx={{
                          bgcolor: message.priority === 'high' ? 'error.light' : 'inherit',
                          borderRadius: 1,
                          mb: 1,
                          p: 1,
                        }}
                      >
                        <ListItemText
                          primary={message.content || 'No content'}
                          secondary={`To: ${message.course?.title || 'All'} - ${new Date(message.createdAt).toLocaleDateString('en-PK')}`}
                        />
                        {message.priority === 'high' && (
                          <Chip label="Urgent" color="error" size="small" sx={{ ml: 1 }} />
                        )}
                      </ListItem>
                    )) : <ListItem><ListItemText primary="No recent announcements" /></ListItem>}
                  </List>
                  {messages.length >= 5 && (
                    <Tooltip title="View all announcements">
                      <Button
                        component={Link}
                        to="/teacher/communication"
                        variant="outlined"
                        color="primary"
                        sx={{ mt: 1, borderRadius: 2 }}
                        aria-label="View all announcements"
                      >
                        View All
                      </Button>
                    </Tooltip>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: 5 },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2, fontWeight: 'medium' }}>
                    <BarChart sx={{ mr: 1, color: 'primary.main' }} /> Quick Stats
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Courses Taught: {courses.length}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Pending Gradings: {submissions.length}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Total Students: {courses.reduce((sum, c) => sum + (c.students?.length || 0), 0)}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    component={Link}
                    to="/teacher/assessment-grading"
                    variant="outlined"
                    color="primary"
                    sx={{ borderRadius: 2 }}
                    aria-label="View detailed stats"
                  >
                    View Detailed Stats
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: 5 },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2, fontWeight: 'medium' }}>
                    <Group sx={{ mr: 1, color: 'primary.main' }} /> Student Performance
                  </Typography>
                  <List dense>
                    {studentPerformance.length ? studentPerformance.map((perf) => (
                      <ListItem
                        key={perf.id}
                        sx={{ borderRadius: 1, mb: 1, p: 1 }}
                      >
                        <ListItemText
                          primary={
                            <Link
                              to={`/teacher/courses/${perf.courseId}`}
                              style={{ textDecoration: 'none', color: 'primary.main' }}
                            >
                              {perf.courseTitle}
                            </Link>
                          }
                          secondary={`Avg. Grade: ${perf.averageGrade}% - Students: ${perf.studentsEnrolled}`}
                        />
                      </ListItem>
                    )) : <ListItem><ListItemText primary="No performance data available" /></ListItem>}
                  </List>
                  <Button
                    component={Link}
                    to="/teacher/assessment-grading"
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 1, borderRadius: 2 }}
                    aria-label="View detailed performance"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: 5 },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2, fontWeight: 'medium' }}>
                    <Assessment sx={{ mr: 1, color: 'primary.main' }} /> Recent Activity
                  </Typography>
                  <List dense>
                    {recentActivity.length ? recentActivity.map((activity) => (
                      <ListItem key={activity.id} sx={{ borderRadius: 1, mb: 1, p: 1 }}>
                        <ListItemText
                          primary={activity.description}
                          secondary={`Type: ${activity.type} - ${activity.date}`}
                        />
                      </ListItem>
                    )) : <ListItem><ListItemText primary="No recent activity" /></ListItem>}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Tooltip title="Manage all courses">
            <Button
              component={Link}
              to="/teacher/course-management"
              variant="contained"
              color="primary"
              startIcon={<School />}
              sx={{ borderRadius: 2, px: 3 }}
              aria-label="Manage courses"
            >
              Courses
            </Button>
          </Tooltip>
          <Tooltip title="Grade assessments">
            <Button
              component={Link}
              to="/teacher/assessment-grading"
              variant="contained"
              color="primary"
              startIcon={<Assessment />}
              sx={{ borderRadius: 2, px: 3 }}
              aria-label="Grade assessments"
            >
              Assessments
            </Button>
          </Tooltip>
          <Tooltip title="Manage communications">
            <Button
              component={Link}
              to="/teacher/communication"
              variant="contained"
              color="primary"
              startIcon={<Forum />}
              sx={{ borderRadius: 2, px: 3 }}
              aria-label="Manage communications"
            >
              Communication
            </Button>
          </Tooltip>
        </Box>
      </Box>
    </Container>
  );
};

export default TeacherDashboard;