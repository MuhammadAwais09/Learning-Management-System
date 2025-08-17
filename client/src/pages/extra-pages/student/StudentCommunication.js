import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, List, ListItem, ListItemText, Tabs, Tab, MenuItem, CircularProgress } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const StudentCommunication = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [forums, setForums] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [tabValue, setTabValue] = useState(0);
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
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedCourses = Array.isArray(response.data.courses) ? response.data.courses : [];
        setCourses(fetchedCourses);
        setSelectedCourse(fetchedCourses.length > 0 ? fetchedCourses[0]._id : '');
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load communication data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchForums();
      fetchAnnouncements();
      fetchUsers();
    } else {
      setForums([]);
      setMessages([]);
      setUsers([]);
      setSelectedUser('');
    }
  }, [selectedCourse]);

  const fetchForums = async () => {
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/forums/course/${selectedCourse}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForums(Array.isArray(response.data.forums) ? response.data.forums : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load forums');
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { courseId: selectedCourse, isAnnouncement: true },
      });
      setMessages(Array.isArray(response.data.messages) ? response.data.messages : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load announcements');
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/courses/${selectedCourse}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const course = response.data.course;
      setUsers(Array.isArray(course.students) ? [...course.students, course.teacher].filter(u => u) : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    }
  };

  const fetchDirectMessages = async (userId) => {
    if (!userId) return;
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { recipientId: userId, courseId: selectedCourse },
      });
      setMessages(Array.isArray(response.data.messages) ? response.data.messages : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load messages');
    }
  };

  const handlePostSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/forums/${values.forumId}/posts`,
        { content: values.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForums(forums.map(f => f._id === values.forumId ? response.data.forum : f));
      resetForm();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit post');
    } finally {
      setSubmitting(false);
    }
  };

const handleMessageSubmit = async (values, { setSubmitting, resetForm }) => {
  try {
    const token = localStorage.getItem('learnify_token');
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/messages/send`,
      { recipientId: selectedUser, content: values.content, courseId: selectedCourse },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Append the new message to the existing messages
    setMessages((prevMessages) => [...prevMessages, response.data.message]);
    // Optionally, refetch messages to ensure sync with backend
    await fetchDirectMessages(selectedUser);
    resetForm();
    setError(null);
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to send message');
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

  if (courses.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Communication</Typography>
        <Typography variant="h6" color="textSecondary">
          No courses assigned to you
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Communication</Typography>
      <TextField
        select
        label="Select Course"
        value={selectedCourse}
        onChange={(e) => {
          setSelectedCourse(e.target.value);
          setSelectedUser(''); // Reset selected user when course changes
          setMessages([]); // Clear messages when course changes
        }}
        fullWidth
        sx={{ mb: 3 }}
        disabled={courses.length === 0}
      >
        {courses.map((course) => (
          <MenuItem key={course._id} value={course._id}>{course.title || 'Unnamed Course'}</MenuItem>
        ))}
      </TextField>
      {selectedCourse && (
        <>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
            <Tab label="Forums" />
            <Tab label="Announcements" />
            <Tab label="Messages" />
          </Tabs>
          {tabValue === 0 && (
            <Box>
              {forums.length > 0 ? forums.map((forum) => (
                <Card key={forum._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{forum.title || 'Unnamed Forum'}</Typography>
                    <Typography color="text.secondary">{forum.description || 'No description'}</Typography>
                    <List>
                      {forum.posts?.length > 0 ? forum.posts.map((post, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={post.content || 'No content'}
                            secondary={`By ${post.author?.name || 'Unknown'} - ${new Date(post.createdAt).toLocaleDateString()}`}
                          />
                        </ListItem>
                      )) : <ListItem><ListItemText primary="No posts yet" /></ListItem>}
                    </List>
                    <Formik
                      initialValues={{ forumId: forum._id, content: '' }}
                      validationSchema={Yup.object({
                        content: Yup.string()
                          .required('Content is required')
                          .min(1)
                          .max(1000, 'Post is too long')
                      })}
                      onSubmit={handlePostSubmit}
                    >
                      {({ errors, touched, isSubmitting }) => (
                        <Form>
                          <Field
                            as={TextField}
                            name="content"
                            label="Add Post"
                            fullWidth
                            multiline
                            rows={2}
                            error={touched.content && !!errors.content}
                            helperText={touched.content && errors.content}
                            sx={{ mb: 2 }}
                          />
                          <Button type="submit" variant="contained" disabled={isSubmitting}>Post</Button>
                        </Form>
                      )}
                    </Formik>
                  </CardContent>
                </Card>
              )) : <Typography>No forums available for this course</Typography>}
            </Box>
          )}
          {tabValue === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6">Announcements</Typography>
                <List>
                  {messages.length > 0 ? messages.map((message) => (
                    <ListItem key={message._id}>
                      <ListItemText
                        primary={message.content || 'No content'}
                        secondary={`By ${message.sender?.name || 'Unknown'} - ${new Date(message.createdAt).toLocaleDateString()}`}
                      />
                    </ListItem>
                  )) : <Typography>No announcements available</Typography>}
                </List>
              </CardContent>
            </Card>
          )}
          {tabValue === 2 && (
            <Box>
              <TextField
                select
                label="Select User"
                value={selectedUser}
                onChange={(e) => {
                  setSelectedUser(e.target.value);
                  if (e.target.value) fetchDirectMessages(e.target.value);
                }}
                fullWidth
                sx={{ mb: 3 }}
                disabled={!users.length}
              >
                {users.length > 0 ? users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name || 'Unknown'} ({user.role || 'Unknown'})
                  </MenuItem>
                )) : <MenuItem value="" disabled>No users available</MenuItem>}
              </TextField>
              {selectedUser && (
                <>
                  <Card sx={{ mb: 3, maxHeight: '50vh', overflowY: 'auto' }}>
                    <CardContent>
                      <Typography variant="h6">Messages</Typography>
                      <List>
                        {messages.length > 0 ? messages.map((message) => (
                          <ListItem key={message._id}>
                            <ListItemText
                              primary={message.content || 'No content'}
                              secondary={`From ${message.sender?.name || 'Unknown'} - ${new Date(message.createdAt).toLocaleTimeString()}`}
                            />
                          </ListItem>
                        )) : <Typography>No messages yet</Typography>}
                      </List>
                    </CardContent>
                  </Card>
                  <Formik
                    initialValues={{ content: '' }}
                    validationSchema={Yup.object({
                      content: Yup.string()
                        .required('Message is required')
                        .min(1)
                        .max(500, 'Message is too long')
                    })}
                    onSubmit={handleMessageSubmit}
                  >
                    {({ errors, touched, isSubmitting }) => (
                      <Form>
                        <Field
                          as={TextField}
                          name="content"
                          label="Send Message"
                          fullWidth
                          multiline
                          rows={2}
                          error={touched.content && !!errors.content}
                          helperText={touched.content && errors.content}
                          sx={{ mb: 2 }}
                        />
                        <Button type="submit" variant="contained" disabled={isSubmitting}>Send</Button>
                      </Form>
                    )}
                  </Formik>
                </>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default StudentCommunication;