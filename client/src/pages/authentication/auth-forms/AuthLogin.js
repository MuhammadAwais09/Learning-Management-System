import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Button,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Stack,
    Typography,
    FormHelperText,
    CircularProgress,
    Paper,
    Box,
} from '@mui/material';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import axios from 'axios';
import AnimateButton from 'components/@extended/AnimateButton';
import welcomeImage from 'assets/images/icons/welcome.jpg';

const AuthLogin = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <Grid container component={Paper} elevation={3} sx={{ height: '100vh', display: 'flex' }}>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: { xs: 3, md: 4 } }}>
                <Stack alignItems="center" spacing={3}>
                    <Typography variant="h4" fontWeight="bold" color="primary" textAlign="center">
                        Welcome Back To Learnify Portal!
                    </Typography>
                    <Typography variant="body1" color="textSecondary" textAlign="center">
                        Log in to access your dashboard and manage your data efficiently.
                    </Typography>
                    <img src={welcomeImage} alt="Welcome" style={{ width: '80%', maxWidth: 400 }} />
                </Stack>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: { xs: 3, md: 4 } }}>
                <Formik
                    initialValues={{ email: '', password: '', submit: null }}
                    validationSchema={Yup.object({
                        email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
                        password: Yup.string().max(255).required('Password is required'),
                    })}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        setIsLoading(true);
                        try {
                            const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, values);
                            localStorage.setItem('learnify_token', response.data.token);
                            localStorage.setItem('role', response.data.user.role);
                            localStorage.setItem('userId', response.data.user.id);
                            localStorage.setItem('name', response.data.user.name);
                            setStatus({ success: true });
                            setSubmitting(false);
                            if (response.data.user.role === 'Admin') {
                                navigate('/admin/dashboard');
                            } else if (response.data.user.role === 'Teacher') {
                                navigate('/teacher/dashboard');
                            } else {
                                navigate('/student/dashboard');
                            }
                        } catch (err) {
                            setStatus({ success: false });
                            setErrors({ submit: err.response?.data?.error || err.message || 'Login failed' });
                            setSubmitting(false);
                        }
                        setIsLoading(false);
                    }}
                >
                    {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                        <form noValidate onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400 }}>
                            <Stack spacing={3}>
                                <Stack spacing={1}>
                                    <InputLabel>Email Address</InputLabel>
                                    <OutlinedInput
                                        type="email"
                                        value={values.email}
                                        name="email"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        placeholder="Enter email"
                                        fullWidth
                                        error={Boolean(touched.email && errors.email)}
                                    />
                                    {touched.email && errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
                                </Stack>
                                <Stack spacing={1}>
                                    <InputLabel>Password</InputLabel>
                                    <OutlinedInput
                                        fullWidth
                                        error={Boolean(touched.password && errors.password)}
                                        type={showPassword ? 'text' : 'password'}
                                        value={values.password}
                                        name="password"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                                                    {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        placeholder="Enter password"
                                    />
                                    {touched.password && errors.password && <FormHelperText error>{errors.password}</FormHelperText>}
                                </Stack>
                                {errors.submit && <FormHelperText error>{errors.submit}</FormHelperText>}
                                <AnimateButton>
                                    <Button
                                        disableElevation
                                        disabled={isSubmitting || isLoading}
                                        fullWidth
                                        size="large"
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        startIcon={isLoading && <CircularProgress size={24} color="inherit" />}
                                    >
                                        {isLoading ? 'Logging in...' : 'Login'}
                                    </Button>
                                </AnimateButton>
                                <Typography variant="body2" textAlign="center">
                                    Don't have an account?{' '}
                                    <Button component={RouterLink} to="/register" variant="text" color="primary">
                                        Register
                                    </Button>
                                </Typography>
                            </Stack>
                        </form>
                    )}
                </Formik>
            </Grid>
        </Grid>
    );
};

export default AuthLogin;