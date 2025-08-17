import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  Modal,
  Typography,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const token = localStorage.getItem('learnify_token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/users`, { headers });
        setUsers(response.data.users || []);
      } catch (err) {
        setSnackbarMessage(err.response?.data?.error || 'Failed to fetch users');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const showModal = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setIsModalVisible(true);
  };

  const handleAction = async () => {
    try {
      const endpoint = actionType;
      const method = actionType === 'delete' ? 'delete' : 'put';

      await axios({
        method,
        url: `${process.env.REACT_APP_API_URL}/admin/users/${selectedUser._id}/${endpoint}`,
        headers,
      });

      if (actionType === 'delete') {
        setUsers((prevUsers) => prevUsers.filter((u) => u._id !== selectedUser._id));
      } else {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u._id === selectedUser._id
              ? {
                  ...u,
                  status:
                    actionType === 'approve'
                      ? 'Active'
                      : actionType === 'reject'
                      ? 'Inactive'
                      : 'Deactivated',
                }
              : u
          )
        );
      }

      setSnackbarMessage(`User ${actionType}d successfully`);
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage(err.response?.data?.error || 'Failed to perform the action');
      setSnackbarOpen(true);
    } finally {
      setIsModalVisible(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => showModal(user, 'approve')}
                        disabled={user.status === 'Active'}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => showModal(user, 'reject')}
                        disabled={user.status === 'Inactive'}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        onClick={() => showModal(user, 'deactivate')}
                        disabled={user.status === 'Deactivated'}
                      >
                        Deactivate
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => showModal(user, 'delete')}
                      >
                        Delete
                      </Button>
                    </Box>
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
        aria-labelledby="user-action-modal"
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
          <Typography>
            Are you sure you want to {actionType} <strong>{selectedUser?.name}</strong>?
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setIsModalVisible(false)} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleAction}>
              {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
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

export default UserManagement;
