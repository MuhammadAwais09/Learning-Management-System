import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import { AddCircle, School, People, Dashboard as DashboardIcon } from '@mui/icons-material';
import axios from 'axios';

const AdminDashboard = () => {
  const token = localStorage.getItem('learnify_token');
  const headers = { Authorization: `Bearer ${token}` };

  const [isLoading, setIsLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [teachersRes, studentsRes, coursesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/admin/teachers`, { headers }),
          axios.get(`${process.env.REACT_APP_API_URL}/admin/students`, { headers }),
          axios.get(`${process.env.REACT_APP_API_URL}/admin/courses`, { headers }),
        ]);
        setTeachers(teachersRes.data.teachers || []);
        setStudents(studentsRes.data.students || []);
        setCourses(coursesRes.data.courses || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Container>
        <Box mt={4} mb={6} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h3" gutterBottom>
            Welcome to Learnify Admin Dashboard
          </Typography>
          <Chip label="Admin" color="primary" icon={<Avatar sx={{ bgcolor: 'primary.main' }} />} />
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardHeader
                title="Total Teachers"
                subheader="Manage Teacher Applications"
                avatar={<School />}
              />
              <CardContent>
                <Typography variant="h5" color="primary">
                  {teachers.length}
                </Typography>
                <Divider sx={{ my: 1 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardHeader
                title="Total Students"
                subheader="Student Enrollment Stats"
                avatar={<People />}
              />
              <CardContent>
                <Typography variant="h5" color="primary">
                  {students.length}
                </Typography>
                <Divider sx={{ my: 1 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardHeader
                title="Total Courses"
                subheader="Course Stats Overview"
                avatar={<DashboardIcon />}
              />
              <CardContent>
                <Typography variant="h5" color="primary">
                  {courses.length}
                </Typography>
                <Divider sx={{ my: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
