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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import axios from 'axios';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
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
        setCourses(Array.isArray(response.data.courses) ? response.data.courses : []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load courses');
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const downloadMaterial = async (courseId, materialUrl) => {
    try {
      if (!materialUrl || !courseId) {
        throw new Error('Invalid material or course ID');
      }
      // Simulate file download since no server/AWS is available
      const mockFileContent = new Blob(['Sample content for ' + materialUrl], { type: 'text/plain' });
      const url = window.URL.createObjectURL(mockFileContent);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', materialUrl.split('-').pop() || 'material.txt');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success dialog
      setDialogMessage('File downloaded successfully!');
      setDialogOpen(true);
      setError(null);
    } catch (err) {
      setDialogMessage(err.message || 'Failed to download material');
      setDialogOpen(true);
      setError(err.message || 'Failed to download material');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogMessage('');
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  if (error) return (
    <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
      <Typography color="error" variant="h6">{error}</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => window.location.reload()}
        sx={{ mt: 2, borderRadius: 2 }}
        aria-label="Retry loading courses"
      >
        Retry
      </Button>
    </Box>
  );

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Card sx={{ mb: 3, bgcolor: 'linear-gradient(45deg, #1e3a8a 30%, #3b82f6 90%)', color: '#000000', borderRadius: 2, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Enrolled Courses
          </Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>
            {courses.length === 0
              ? 'No courses assigned to you. Start exploring now!'
              : `Explore your ${courses.length} enrolled course${courses.length !== 1 ? 's' : ''}`}
          </Typography>
        </CardContent>
      </Card>

      {courses.length === 0 ? (
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center' }}>
          No courses assigned to you
        </Typography>
      ) : (
        courses.map((course) => (
          <Card
            key={course._id}
            sx={{
              mb: 2,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 3,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.02)', boxShadow: 5 },
            }}
          >
            <CardContent>
              <Typography variant="h6">{course.title || 'Unnamed Course'}</Typography>
              <Typography color="text.secondary">{course.description || 'No description'}</Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Materials</Typography>
              <List>
                {Array.isArray(course.materials) && course.materials.length > 0 ? (
                  course.materials.map((material) => (
                    <ListItem key={material._id} sx={{ borderRadius: 1, mb: 1, p: 1 }}>
                      <ListItemText
                        primary={material.name || 'Unnamed Material'}
                        secondary={`Type: ${material.type || 'Unknown'}`}
                      />
                      <Button
                        onClick={() => downloadMaterial(course._id, material.url)}
                        variant="contained"
                        color="primary"
                        disabled={!material.url}
                        sx={{ borderRadius: 2 }}
                        aria-label={`Download material ${material.name || 'Unnamed Material'}`}
                      >
                        Download
                      </Button>
                    </ListItem>
                  ))
                ) : (
                  <ListItem><ListItemText primary="No materials available" /></ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="download-dialog-title"
      >
        <DialogTitle id="download-dialog-title">Download Status</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary" variant="contained" sx={{ borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentCourses;