import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const TeacherSettings = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const showSuccessDialog = (message) => {
    setSuccess(message);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handlePasswordSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/users/password`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccessDialog('Password updated successfully');
      setError(null);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
      setSuccess(null);
    } finally {
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
      showSuccessDialog('Notification preferences updated');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update notifications');
      setSuccess(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      {error && <Typography color="error">{error}</Typography>}

      {/* Success Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{ zIndex: 1400 }} // Higher than most MUI elements
      >
        <DialogTitle>{success}</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDialog} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password */}
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
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  Update Password
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
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
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  Update Preferences
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeacherSettings;
