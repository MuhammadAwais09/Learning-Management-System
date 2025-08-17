import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Typography,
  Box,
  Snackbar,
  Alert,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
} from '@mui/material';
import axios from 'axios';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const token = localStorage.getItem('learnify_token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/teachers`, { headers });
        setTeachers(response.data.teachers || []);
      } catch (err) {
        setSnackbarMessage(err.response?.data?.error || 'Failed to fetch teachers');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const showModal = (teacher, action) => {
    setSelectedTeacher(teacher);
    setActionType(action);
    setIsModalVisible(true);
  };

  const handleAction = async () => {
    try {
      const endpoint = actionType === 'approve' ? 'approve' : 'reject';
      await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/teachers/${selectedTeacher._id}/${endpoint}`,
        {},
        { headers }
      );
      setTeachers((prevTeachers) =>
        prevTeachers.map((teacher) =>
          teacher._id === selectedTeacher._id
            ? { ...teacher, status: actionType === 'approve' ? 'Approved' : 'Rejected' }
            : teacher
        )
      );
      setSnackbarMessage(`Teacher ${actionType}d successfully`);
      setSnackbarOpen(true);
      setIsModalVisible(false);
    } catch (err) {
      setSnackbarMessage(err.response?.data?.error || 'Failed to perform the action');
      setSnackbarOpen(true);
      setIsModalVisible(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Teacher Management
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="teacher table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Courses</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher._id}>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.contactDetails?.phone || 'N/A'}</TableCell>
                  <TableCell>{teacher.contactDetails?.address || 'N/A'}</TableCell>
                  <TableCell>
                    <Box sx={{ maxWidth: 200, maxHeight: 80, overflowY: 'auto' }}>
                      {teacher.createdCourses?.length
                        ? teacher.createdCourses.map((c, i) => (
                            <Typography key={i} variant="body2">
                              • {c.title}
                            </Typography>
                          ))
                        : 'None'}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => showModal(teacher, 'approve')}
                      disabled={teacher.status === 'Approved'}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => showModal(teacher, 'reject')}
                      disabled={teacher.status === 'Rejected'}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Modal
        open={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        aria-labelledby="teacher-action-modal"
      >
        <Box
          sx={{
            width: 400,
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -30%)',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
          </Typography>
          <Typography sx={{ mb: 3 }}>
            Are you sure you want to {actionType} <strong>{selectedTeacher?.name}</strong>?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setIsModalVisible(false)} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleAction}>
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
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

export default TeacherManagement;
