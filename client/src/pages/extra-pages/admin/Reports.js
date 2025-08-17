import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const Reports = () => {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const token = localStorage.getItem('learnify_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/reports`, { headers });
      setReports(response.data.reports || {});
      setSnackbarMessage('Reports fetched successfully');
    } catch (err) {
      setSnackbarMessage(err.response?.data?.error || 'Failed to fetch reports');
    } finally {
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const reportCard = (title, data = []) => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Box sx={{ mt: 1 }}>
          {data.map(([label, value], index) => (
            <Typography key={index}>
              {label}: {value ?? 0}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reports Dashboard
      </Typography>

      {loading && !Object.keys(reports).length ? (
        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {reportCard('Student Progress', [
              ['Total Students', reports.studentProgress?.totalStudents],
              ['Completed', reports.studentProgress?.completed],
              ['In Progress', reports.studentProgress?.inProgress],
              ['Failed', reports.studentProgress?.failed],
            ])}
          </Grid>

          <Grid item xs={12} md={6}>
            {reportCard('Teacher Performance', [
              ['Total Teachers', reports.teacherPerformance?.totalTeachers],
              ['High Performance', reports.teacherPerformance?.highPerformance],
              ['Average Performance', reports.teacherPerformance?.averagePerformance],
              ['Low Performance', reports.teacherPerformance?.lowPerformance],
            ])}
          </Grid>

          <Grid item xs={12} md={6}>
            {reportCard('Course Completion Rates', [
              ['Total Courses', reports.courseCompletion?.totalCourses],
              ['Completed', reports.courseCompletion?.completed],
              ['Pending', reports.courseCompletion?.pending],
            ])}
          </Grid>

          <Grid item xs={12} md={6}>
            {reportCard('System Usage', [
              ['Active Users', reports.systemUsage?.activeUsers],
              ['Inactive Users', reports.systemUsage?.inactiveUsers],
              ['Total Logins', reports.systemUsage?.totalLogins],
            ])}
          </Grid>
        </Grid>
      )}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
        <Button variant="contained" color="primary" onClick={fetchReports} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Reports'}
        </Button>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarMessage.includes('Failed') ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports;
