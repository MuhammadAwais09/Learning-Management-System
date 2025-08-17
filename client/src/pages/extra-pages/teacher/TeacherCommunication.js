import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, List, ListItem, ListItemText, Tabs, Tab, MenuItem, CircularProgress } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const TeacherCommunication = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [forums, setForums] = useState([]);
  const [messages, setMessages] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('learnify_token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(Array.isArray(response.data.courses) ? response.data.courses : []);
        setSelectedCourse(response.data.courses[0]?._id || '');
        setLoading(false);
      } catch (err) {
        console.error('Fetch Data Error:', err);
        setError(err.response?.data?.error || 'Failed to load communication data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchForums();
      fetchAnnouncements();
      fetchStudents();
    }
  }, [selectedCourse]);

  const fetchForums = async () => {
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/forums/course/${selectedCourse}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForums(Array.isArray(response.data.forums) ? response.data.forums : []);
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
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load announcements');
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/courses/${selectedCourse}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(Array.isArray(response.data.course.students) ? response.data.course.students.filter(student => student && student._id && student.name) : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load students');
    }
  };

  const fetchDirectMessages = async (studentId) => {
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { recipientId: studentId, courseId: selectedCourse },
      });
      setMessages(Array.isArray(response.data.messages) ? response.data.messages : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load messages');
    }
  };

  const handleForumSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/forums`,
        { ...values, courseId: selectedCourse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForums([...forums, response.data.forum]);
      resetForm();
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create forum');
      setSubmitting(false);
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
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit post');
      setSubmitting(false);
    }
  };

  const handleAnnouncementSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/messages/announcement`,
        { content: values.content, courseId: selectedCourse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAnnouncements(); // Refetch to ensure latest state
      resetForm();
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send announcement');
      setSubmitting(false);
    }
  };

  const handleMessageSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/messages/send`,
        { recipientId: selectedStudent, content: values.content, courseId: selectedCourse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchDirectMessages(selectedStudent); // Refetch to ensure latest state
      resetForm();
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
      setSubmitting(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Communication</Typography>
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
            <MenuItem key={course._id} value={course._id}>{course.title}</MenuItem>
          ))
        ) : (
          <MenuItem disabled>No courses available</MenuItem>
        )}
      </TextField>
      {selectedCourse && (
        <>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
            <Tab label="Forums" />
            <Tab label="Announcements" />
            <Tab label="Direct Messages" />
          </Tabs>
          {tabValue === 0 && (
            <Box>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">Create Forum</Typography>
                  <Formik
                    initialValues={{ title: '', description: '' }}
                    validationSchema={Yup.object({
                      title: Yup.string().required('Title is required'),
                      description: Yup.string().required('Description is required'),
                    })}
                    onSubmit={handleForumSubmit}
                  >
                    {({ errors, touched, isSubmitting }) => (
                      <Form>
                        <Field
                          as={TextField}
                          name="title"
                          label="Forum Title"
                          fullWidth
                          error={touched.title && !!errors.title}
                          helperText={touched.title && errors.title}
                          sx={{ mb: 2 }}
                        />
                        <Field
                          as={TextField}
                          name="description"
                          label="Description"
                          fullWidth
                          multiline
                          rows={4}
                          error={touched.description && !!errors.description}
                          helperText={touched.description && errors.description}
                          sx={{ mb: 2 }}
                        />
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                          Create Forum
                        </Button>
                      </Form>
                    )}
                  </Formik>
                  <Typography variant="h6" sx={{ mt: 3 }}>Existing Forums</Typography>
                  {forums.length ? (
                    forums.map((forum) => (
                      <Card key={forum._id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="h6">{forum.title}</Typography>
                          <Typography color="text.secondary">{forum.description}</Typography>
                          <List>
                            {forum.posts.length ? (
                              forum.posts.map((post, index) => (
                                <ListItem key={index}>
                                  <ListItemText
                                    primary={post.content}
                                    secondary={`By ${post.author?.name || 'Unknown'} - ${new Date(post.createdAt).toLocaleDateString()}`}
                                  />
                                </ListItem>
                              ))
                            ) : (
                              <Typography>No posts available</Typography>
                            )}
                          </List>
                          <Formik
                            initialValues={{ forumId: forum._id, content: '' }}
                            validationSchema={Yup.object({ content: Yup.string().required('Content is required') })}
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
                                <Button type="submit" variant="contained" disabled={isSubmitting}>
                                  Post
                                </Button>
                              </Form>
                            )}
                          </Formik>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography>No forums available</Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
          {tabValue === 1 && (
            <Box>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">Post Announcement</Typography>
                  <Formik
                    initialValues={{ content: '' }}
                    validationSchema={Yup.object({ content: Yup.string().required('Content is required') })}
                    onSubmit={handleAnnouncementSubmit}
                  >
                    {({ errors, touched, isSubmitting }) => (
                      <Form>
                        <Field
                          as={TextField}
                          name="content"
                          label="Announcement"
                          fullWidth
                          multiline
                          rows={4}
                          error={touched.content && !!errors.content}
                          helperText={touched.content && errors.content}
                          sx={{ mb: 2 }}
                        />
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                          Post Announcement
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </CardContent>
              </Card>
              <Typography variant="h6">Announcements</Typography>
              {messages.length ? (
                <List>
                  {messages.map((msg) => (
                    <ListItem key={msg._id}>
                      <ListItemText
                        primary={msg.content}
                        secondary={`To: ${msg.course?.title || 'All'} - ${new Date(msg.createdAt).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>No announcements available</Typography>
              )}
            </Box>
          )}
          {tabValue === 2 && (
            <Box>
              <TextField
                select
                label="Select Student"
                value={selectedStudent}
                onChange={(e) => {
                  setSelectedStudent(e.target.value);
                  if (e.target.value) fetchDirectMessages(e.target.value);
                }}
                fullWidth
                SelectProps={{
                  MenuProps: {
                    disableAutoFocusItem: true, // Prevent dropdown from closing after selection
                  },
                }}
                sx={{ mb: 3 }}
              >
                <MenuItem value="">Select a student</MenuItem>
                {students.length ? (
                  students.map((student) => (
                    <MenuItem key={student._id} value={student._id}>
                      {student.name || 'Unknown Student'} {student.email ? `(${student.email})` : `(ID: ${student._id})`}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No students enrolled</MenuItem>
                )}
              </TextField>
              {selectedStudent && (
                <>
                  <Formik
                    initialValues={{ content: '' }}
                    validationSchema={Yup.object({ content: Yup.string().required('Content is required') })}
                    onSubmit={handleMessageSubmit}
                  >
                    {({ errors, touched, isSubmitting }) => (
                      <Form>
                        <Field
                          as={TextField}
                          name="content"
                          label="Message"
                          fullWidth
                          multiline
                          rows={4}
                          error={touched.content && !!errors.content}
                          helperText={touched.content && errors.content}
                          sx={{ mb: 2 }}
                        />
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                          Send
                        </Button>
                      </Form>
                    )}
                  </Formik>
                  <Typography variant="h6" sx={{ mt: 2 }}>Messages</Typography>
                  {messages.length ? (
                    <List>
                      {messages.map((msg) => (
                        <ListItem key={msg._id}>
                          <ListItemText
                            primary={msg.content}
                            secondary={`From ${msg.sender?.name || 'Unknown'} - ${new Date(msg.createdAt).toLocaleDateString()}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>No messages available</Typography>
                  )}
                </>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

// Error Boundary Component
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
    <TeacherCommunication />
  </ErrorBoundary>
);