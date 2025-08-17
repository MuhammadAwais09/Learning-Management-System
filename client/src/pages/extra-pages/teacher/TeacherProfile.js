import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const TeacherProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('learnify_token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data.user);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load profile');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (values, { setSubmitting }) => {
    try {
      const token = localStorage.getItem('learnify_token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/users/profile`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data.user);
      setSuccess('Profile updated successfully');
      setError(null);
      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      setSuccess(null);
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setSuccess(null);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Profile</Typography>
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
      <Card>
        <CardContent>
          <Formik
            initialValues={{
              name: profile.name || '',
              bio: profile.bio || '',
              contactDetails: {
                phone: profile.contactDetails?.phone || '',
                address: profile.contactDetails?.address || '',
              },
            }}
            validationSchema={Yup.object({
              name: Yup.string().required('Name is required'),
              bio: Yup.string(),
              contactDetails: Yup.object({
                phone: Yup.string(),
                address: Yup.string(),
              }),
            })}
            onSubmit={handleProfileSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Field
                  as={TextField}
                  name="name"
                  label="Name"
                  fullWidth
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                  sx={{ mb: 2 }}
                />
                <Field
                  as={TextField}
                  name="bio"
                  label="Bio"
                  fullWidth
                  multiline
                  rows={4}
                  error={touched.bio && !!errors.bio}
                  helperText={touched.bio && errors.bio}
                  sx={{ mb: 2 }}
                />
                <Field
                  as={TextField}
                  name="contactDetails.phone"
                  label="Phone"
                  fullWidth
                  error={touched.contactDetails?.phone && !!errors.contactDetails?.phone}
                  helperText={touched.contactDetails?.phone && errors.contactDetails?.phone}
                  sx={{ mb: 2 }}
                />
                <Field
                  as={TextField}
                  name="contactDetails.address"
                  label="Address"
                  fullWidth
                  error={touched.contactDetails?.address && !!errors.contactDetails?.address}
                  helperText={touched.contactDetails?.address && errors.contactDetails?.address}
                  sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  Update Profile
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TeacherProfile;