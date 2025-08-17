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
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Assignment,
  Quiz,
  Notifications,
  School,
  Assessment,
  Forum,
  History,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const StudentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [courses, setCourses] = useState([]);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock recent activity (replace with backend endpoint if available)
  const recentActivity = [
    { id: 1, type: 'Submission', description: 'Submitted Assignment: Math Homework', date: new Date().toLocaleDateString('en-PK') },
    { id: 2, type: 'Quiz', description: 'Completed Quiz: Physics Test', date: new Date().toLocaleDateString('en-PK') },
    { id: 3, type: 'Material', description: 'Viewed Material: Lecture Notes', date: new Date().toLocaleDateString('en-PK') },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('learnify_token');
        if (!token || !userId) {
          throw new Error('Authentication token or user ID missing');
        }
        const [coursesRes, assignmentsRes, quizzesRes, messagesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/courses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/assignments/course/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/quizzes/course/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { isAnnouncement: true },
          }),
        ]);
        const fetchedCourses = Array.isArray(coursesRes.data.courses) ? coursesRes.data.courses : [];
        setCourses(fetchedCourses);
        setAssignments(
          Array.isArray(assignmentsRes.data.assignments)
            ? assignmentsRes.data.assignments.filter(
              (a) => !a.submission?.submittedAt && new Date(a.dueDate) >= new Date()
            )
            : []
        );
        setQuizzes(
          Array.isArray(quizzesRes.data.quizzes)
            ? quizzesRes.data.quizzes.filter(
              (q) => !q.submissions?.some((s) => s.student === userId)
            )
            : []
        );
        setMessages(
          Array.isArray(messagesRes.data.messages)
            ? messagesRes.data.messages.slice(0, 5)
            : []
        );
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load dashboard');
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const isDueSoon = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffHours = (due - now) / (1000 * 60 * 60);
    return diffHours <= 24 && diffHours >= 0;
  };

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
                  Welcome, {localStorage.getItem('userName') || 'Student'}!
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  No courses assigned to you. Start exploring now!
                </Typography>
              </CardContent>
            </Card>
            <Button
              component={Link}
              to="/student/courses"
              variant="contained"
              color="primary"
              startIcon={<School />}
              sx={{ borderRadius: 2, px: 3 }}
              aria-label="Explore available courses"
            >
              Explore Courses
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
                Welcome, {localStorage.getItem('userName') || 'Student'}!
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                Enrolled in {courses.length} course{courses.length !== 1 ? 's' : ''} | {assignments.length} pending assignment{assignments.length !== 1 ? 's' : ''} | {quizzes.length} pending quiz{quizzes.length !== 1 ? 'zes' : ''}
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
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
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: 5 },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Assignment sx={{ mr: 1, color: 'primary.main' }} /> Upcoming Assignments
                  </Typography>
                  <List dense>
                    {assignments.length ? assignments.map((assignment) => (
                  <ListItem
  key={assignment._id}
  sx={{
    bgcolor: isDueSoon(assignment.dueDate) ? 'warning.light' : 'inherit',
    borderRadius: 1,
    mb: 1,
    p: 1,
    mt: 2, // 5px gap on top
  }}
>
  <Grid container direction="column" spacing={1}>
    <Grid item>
      <Typography variant="body1">{assignment.name || 'Unnamed Assignment'}</Typography>
    </Grid>
    <Grid item>
      <Typography variant="body2">Course: {assignment.course?.title || 'Unknown'}</Typography>
    </Grid>
    <Grid item>
      <Typography variant="body2">Due: {new Date(assignment.dueDate).toLocaleDateString('en-PK')}</Typography>
    </Grid>
  </Grid>
  <Grid container justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
    <Grid item>
      {isDueSoon(assignment.dueDate) && (
        <Chip label="Due Soon" color="warning" size="small" />
      )}
    </Grid>
    <Grid item>
      <Tooltip title="Submit this assignment">
        <Button
          component={Link}
          to="/student/assessment-grading"
          variant="outlined"
          color="primary"
          size="small"
          aria-label={`Submit assignment ${assignment.name || 'Unnamed Assignment'}`}
        >
          Submit Now
        </Button>
      </Tooltip>
    </Grid>
  </Grid>
</ListItem>
                    )) : <ListItem><ListItemText primary="No upcoming assignments" /></ListItem>}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
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
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: 5 },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Quiz sx={{ mr: 1, color: 'primary.main' }} /> Upcoming Quizzes
                  </Typography>
                  <List dense>
                    {quizzes.length ? quizzes.map((quiz) => (
                      <ListItem
                        key={quiz._id}
                        secondaryAction={
                          <Tooltip title="Take this quiz">
                            <Button
                              component={Link}
                              to="/student/assessment-grading"
                              variant="outlined"
                              color="primary"
                              size="small"
                              aria-label={`Take quiz ${quiz.title || 'Unnamed Quiz'}`}
                            >
                              Take Now
                            </Button>
                          </Tooltip>
                        }
                        sx={{ borderRadius: 1, mb: 1, p: 1 }}
                      >
                        <ListItemText
                          primary={quiz.title || 'Unnamed Quiz'}
                          secondary={`Course: ${quiz.course?.title || 'Unknown'}`}
                        />
                      </ListItem>
                    )) : <ListItem><ListItemText primary="No upcoming quizzes" /></ListItem>}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
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
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: 5 },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Notifications sx={{ mr: 1, color: 'primary.main' }} /> Recent Notifications
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
                          secondary={`From: ${message.sender?.name || 'Unknown'} - ${new Date(message.createdAt).toLocaleDateString('en-PK')}`}
                        />
                        {message.priority === 'high' && (
                          <Chip label="Urgent" color="error" size="small" sx={{ ml: 1 }} />
                        )}
                      </ListItem>
                    )) : <ListItem><ListItemText primary="No recent notifications" /></ListItem>}
                  </List>
                  {messages.length >= 5 && (
                    <Tooltip title="View all notifications">
                      <Button
                        component={Link}
                        to="/student/communication"
                        variant="outlined"
                        color="primary"
                        sx={{ mt: 1, borderRadius: 2 }}
                        aria-label="View all notifications"
                      >
                        View All Notifications
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
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: 5 },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <History sx={{ mr: 1, color: 'primary.main' }} /> Recent Activity
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
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: 5 },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <School sx={{ mr: 1, color: 'primary.main' }} /> Course Overview
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Enrolled Courses: {courses.length}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Total Pending Tasks: {assignments.length + quizzes.length}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Tooltip title="View all enrolled courses">
            <Button
              component={Link}
              to="/student/courses"
              variant="contained"
              color="primary"
              startIcon={<School />}
              sx={{ borderRadius: 2, px: 3 }}
              aria-label="View all courses"
            >
              Courses
            </Button>
          </Tooltip>
          <Tooltip title="View all assessments">
            <Button
              component={Link}
              to="/student/assessment-grading"
              variant="contained"
              color="primary"
              startIcon={<Assessment />}
              sx={{ borderRadius: 2, px: 3 }}
              aria-label="View all assessments"
            >
              Assessments
            </Button>
          </Tooltip>
          <Tooltip title="View all communications">
            <Button
              component={Link}
              to="/student/communication"
              variant="contained"
              color="primary"
              startIcon={<Forum />}
              sx={{ borderRadius: 2, px: 3 }}
              aria-label="View communication"
            >
              Communication
            </Button>
          </Tooltip>
        </Box>
      </Box>
    </Container>
  );
};

export default StudentDashboard;