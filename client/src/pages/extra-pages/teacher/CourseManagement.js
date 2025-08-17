import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, List, ListItem, ListItemText, CircularProgress, IconButton, MenuItem } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('learnify_token');
        const [coursesRes, studentsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/courses`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/users/students`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setCourses(Array.isArray(coursesRes.data.courses) ? coursesRes.data.courses : []);
        setStudents(Array.isArray(studentsRes.data.students) ? studentsRes.data.students : []);
        setLoading(false);
      } catch (err) {
        console.error('Fetch Data Error:', err);
        setError(err.response?.data?.error || 'Failed to load data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCourseSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      const url = selectedCourse
        ? `${process.env.REACT_APP_API_URL}/courses/${selectedCourse._id}`
        : `${process.env.REACT_APP_API_URL}/courses`;
      const method = selectedCourse ? 'put' : 'post';
      const response = await axios[method](url, values, { headers: { Authorization: `Bearer ${token}` } });
      setCourses(selectedCourse
        ? courses.map(c => c._id === selectedCourse._id ? response.data.course : c)
        : [...courses, response.data.course]);
      resetForm();
      setSelectedCourse(null);
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${selectedCourse ? 'update' : 'create'} course`);
      setSubmitting(false);
    }
  };

  const handleCourseDelete = async (courseId) => {
    try {
      const token = localStorage.getItem('learnify_token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(courses.filter(c => c._id !== courseId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete course');
    }
  };

  const handleMaterialSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      const formData = new FormData();
      formData.append('material', values.material);
      formData.append('name', values.name);
      formData.append('type', values.material.type);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/courses/${values.courseId}/materials`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      setCourses(courses.map(c => c._id === values.courseId ? response.data.course : c));
      resetForm();
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload material');
      setSubmitting(false);
    }
  };

  const handleEnrollmentSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/courses/${values.courseId}/enroll`,
        { studentIds: values.studentIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourses(courses.map(c => c._id === values.courseId ? response.data.course : c));
      resetForm();
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to manage enrollments');
      setSubmitting(false);
    }
  };

  // Filter out students who are already enrolled in the given course
  const getAvailableStudents = (course) => {
    if (!course || !course.students) return students;
    const enrolledStudentIds = course.students.map(student => student._id);
    return students.filter(student => !enrolledStudentIds.includes(student._id));
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Course Management</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">{selectedCourse ? 'Edit Course' : 'Create Course'}</Typography>
          <Formik
            initialValues={{
              title: selectedCourse?.title || '',
              description: selectedCourse?.description || '',
            }}
            validationSchema={Yup.object({
              title: Yup.string().required('Title is required'),
              description: Yup.string().required('Description is required'),
            })}
            onSubmit={handleCourseSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Field
                  as={TextField}
                  name="title"
                  label="Course Title"
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
                <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ mr: 2 }}>
                  {selectedCourse ? 'Update Course' : 'Create Course'}
                </Button>
                {selectedCourse && (
                  <Button variant="outlined" onClick={() => setSelectedCourse(null)}>Cancel</Button>
                )}
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
      <Typography variant="h5" gutterBottom>My Courses</Typography>
      {courses.length ? courses.map((course) => (
        <Card key={course._id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{course.title}</Typography>
              <Box>
                <IconButton onClick={() => setSelectedCourse(course)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleCourseDelete(course._id)}>
                  <Delete />
                </IconButton>
              </Box>
            </Box>
            <Typography color="text.secondary">{course.description}</Typography>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Materials</Typography>
            <List>
              {course.materials.length ? course.materials.map((material) => (
                <ListItem key={material._id}>
                  <ListItemText primary={material.name} secondary={`Type: ${material.type}`} />
                </ListItem>
              )) : <Typography>No materials uploaded</Typography>}
            </List>
            <Formik
              initialValues={{ courseId: course._id, name: '', material: null }}
              validationSchema={Yup.object({
                name: Yup.string().required('Material name is required'),
                material: Yup.mixed().required('File is required'),
              })}
              onSubmit={handleMaterialSubmit}
            >
              {({ setFieldValue, errors, touched, isSubmitting }) => (
                <Form>
                  <Field
                    as={TextField}
                    name="name"
                    label="Material Name"
                    fullWidth
                    error={touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                    sx={{ mb: 2 }}
                  />
                  <input
                    type="file"
                    accept=".pdf,.txt,.mp4"
                    onChange={(e) => setFieldValue('material', e.target.files[0])}
                  />
                  <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ mt: 2 }}>
                    Upload Material
                  </Button>
                </Form>
              )}
            </Formik>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Enrolled Students</Typography>
            <List>
              {course.students.length ? course.students.map((student) => (
                <ListItem key={student._id}>
                  <ListItemText primary={student.name} secondary={student.email || 'No email'} />
                </ListItem>
              )) : <Typography>No students enrolled</Typography>}
            </List>
            <Formik
              initialValues={{ courseId: course._id, studentIds: [] }}
              validationSchema={Yup.object({
                studentIds: Yup.array().min(1, 'Select at least one student'),
              })}
              onSubmit={handleEnrollmentSubmit}
            >
              {({ errors, touched, isSubmitting, setFieldValue, values }) => (
                <Form>
                  <Field
                    as={TextField}
                    select
                    name="studentIds"
                    label="Enroll Students"
                    fullWidth
                    SelectProps={{
                      multiple: true,
                      value: values.studentIds,
                      MenuProps: {
                        disableAutoFocusItem: true, // Prevent dropdown from closing after single selection
                      },
                    }}
                    onChange={(e) => setFieldValue('studentIds', e.target.value)}
                    error={touched.studentIds && !!errors.studentIds}
                    helperText={touched.studentIds && errors.studentIds}
                    sx={{ mb: 2 }}
                  >
                    {getAvailableStudents(course).length ? (
                      getAvailableStudents(course).map((student) => (
                        <MenuItem key={student._id} value={student._id}>{student.name}</MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No students available</MenuItem>
                    )}
                  </Field>
                  <Button type="submit" variant="contained" disabled={isSubmitting}>Enroll</Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      )) : <Typography>No courses available</Typography>}
    </Box>
  );
};

export default CourseManagement;