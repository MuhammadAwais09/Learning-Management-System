import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const StudentSettings = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handlePasswordSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/users/password`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Password updated successfully');
      setError(null);
      resetForm();
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
      setSuccess(null);
      setSubmitting(false);
    }
  };

  const handleNotificationSubmit = async (values, { setSubmitting }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/users/notifications`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Notification preferences updated');
      setError(null);
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update notifications');
      setSuccess(null);
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setSuccess(null);
    setError(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      <Dialog
        open={!!success}
        onClose={handleCloseDialog}
        sx={{ '& .MuiDialog-paper': { zIndex: 1300 } }}
      >
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <DialogContentText>{success}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={!!error}
        onClose={handleCloseDialog}
        sx={{ '& .MuiDialog-paper': { zIndex: 1300 } }}
      >
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText>{error}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="error">
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Change Password</Typography>
          <Formik
            initialValues={{ currentPassword: '', newPassword: '' }}
            validationSchema={Yup.object({
              currentPassword: Yup.string().required('Current password is required'),
              newPassword: Yup.string().min(8, 'Password must be at least 8 characters').required('New password is required'),
            })}
            onSubmit={handlePasswordSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Field
                  as={TextField}
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  fullWidth
                  error={touched.currentPassword && !!errors.currentPassword}
                  helperText={touched.currentPassword && errors.currentPassword}
                  sx={{ mb: 2 }}
                />
                <Field
                  as={TextField}
                  name="newPassword"
                  label="New Password"
                  type="password"
                  fullWidth
                  error={touched.newPassword && !!errors.newPassword}
                  helperText={touched.newPassword && errors.newPassword}
                  sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" disabled={isSubmitting}>Update Password</Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Notification Preferences</Typography>
          <Formik
            initialValues={{ email: true, sms: false }}
            onSubmit={handleNotificationSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <Field
                  as={FormControlLabel}
                  name="email"
                  control={<Checkbox defaultChecked />}
                  label="Receive Email Notifications"
                />
                <Field
                  as={FormControlLabel}
                  name="sms"
                  control={<Checkbox />}
                  label="Receive SMS Notifications"
                />
                <Button type="submit" variant="contained" disabled={isSubmitting}>Update Preferences</Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentSettings;