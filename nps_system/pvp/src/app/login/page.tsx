"use client";

import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/navigation';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Avatar, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const router = useRouter();

    const handleSubmit = async (email:string , password: string) => {
        setLoginError('');
        try {
            const response = await fakeLoginApi(email, password);
            if (response.success) {
                router.push('/dashboard');
            } else {
                setLoginError('Invalid email or password');
            }
        } catch (error) {
            setLoginError('An error occurred. Please try again.');
        }
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setEmail(value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setPassword(value);
    };

    const isFormValid = email !== '' && password !== '';

    return (
        <Container maxWidth={false} className="d-flex align-items-center justify-content-center vh-100 ml-0" sx={{ bgcolor: 'background.default' }}>
            <Card className="p-4" style={{ maxWidth: '400px', borderRadius: '25px' }} elevation={3}>
                <CardContent className="text-center">
                    <Box className="mb-4">
                        <Avatar className="m-auto" sx={{ bgcolor: 'primary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                    </Box>
                    <Typography component="h1" variant="h5" className="mb-3">
                        Sign in
                    </Typography>
                    {loginError && <Alert severity="error" className="mb-3">{loginError}</Alert>}
                    <Box>
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Email Address"
                            autoComplete="email"
                            value={email}
                            onChange={handleEmailChange}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={handlePasswordChange}
                            className='mb-5'
                        />
                        <Button onClick={() => handleSubmit(email, password)} sx={{ borderRadius: '15px'}} fullWidth variant="contained" color="secondary" disabled={!isFormValid}>
                            Sign In
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

// Placeholder for the login API call
const fakeLoginApi = async (email: string, password: string) => {
    return new Promise<{ success: boolean }>((resolve) => {
        setTimeout(() => {
            if (email === 'test@example.com' && password === 'password') {
                resolve({ success: true });
            } else {
                resolve({ success: false });
            }
        }, 1000);
    });
};

export default LoginPage;