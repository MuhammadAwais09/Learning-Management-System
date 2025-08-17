import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  TextField,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import axios from 'axios';

const Settings = () => {
  const [notificationSettings, setNotificationSettings] = useState('email');
  const [paymentGateway, setPaymentGateway] = useState('paypal');
  const [userRole, setUserRole] = useState('admin');
  const [apiKey, setApiKey] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const token = localStorage.getItem('learnify_token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/admin/settings`, { headers });
        const settings = data.settings || {};
        setNotificationSettings(settings.notificationSettings || 'email');
        setPaymentGateway(settings.paymentGateway || 'paypal');
        setUserRole(settings.userRole || 'admin');
        setApiKey(settings.apiKey || '');
      } catch (err) {
        setSnackbarMessage(err.response?.data?.error || 'Failed to fetch settings');
        setSnackbarOpen(true);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/settings`,
        { notificationSettings, paymentGateway, userRole, apiKey },
        { headers }
      );
      setSnackbarMessage('Settings saved successfully');
    } catch (err) {
      setSnackbarMessage(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Notification Type</InputLabel>
                <Select
                  value={notificationSettings}
                  label="Notification Type"
                  onChange={(e) => setNotificationSettings(e.target.value)}
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="sms">SMS</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Gateway
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Payment Gateway</InputLabel>
                <Select
                  value={paymentGateway}
                  label="Payment Gateway"
                  onChange={(e) => setPaymentGateway(e.target.value)}
                >
                  <MenuItem value="paypal">PayPal</MenuItem>
                  <MenuItem value="stripe">Stripe</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Role Permissions
              </Typography>
              <FormControl fullWidth>
                <InputLabel>User Role</InputLabel>
                <Select
                  value={userRole}
                  label="User Role"
                  onChange={(e) => setUserRole(e.target.value)}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="teacher">Teacher</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                API Key (Payment Gateway)
              </Typography>
              <TextField
                fullWidth
                label="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Button variant="contained" color="primary" onClick={handleSaveSettings}>
          Save Settings
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

export default Settings;
