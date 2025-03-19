"use client";

import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get('email'),
            password: data.get('password'),
        });
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setEmail(value);
        setEmailError(!validateEmail(value));
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setPassword(value);
        setPasswordError(value.length < 6);
    };

    const isFormValid = !emailError && !passwordError && email !== '' && password !== '';

    return (
        <Container maxWidth={false} className="d-flex align-items-center justify-content-center vh-100 ml-0" sx={{ bgcolor: 'background.default' }}>
            <Card className="p-4" style={{ maxWidth: '400px' }} elevation={3}>
                <CardContent className="text-center">
                    <Box className="mb-4">
                        <Avatar className="m-auto" sx={{ bgcolor: 'primary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                    </Box>
                    <Typography component="h1" variant="h5" className="mb-3">
                        Sign in
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Email Address"
                            autoComplete="email"
                            value={email}
                            onChange={handleEmailChange}
                            error={emailError}
                            helperText={emailError ? 'Invalid email format' : ''}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={handlePasswordChange}
                            error={passwordError}
                            helperText={passwordError ? 'Password must be at least 6 characters' : ''}
                            className='mb-5'
                        />
                        <Button type='submit' fullWidth variant="contained" color="secondary" disabled={!isFormValid}>
                            Sign In
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default LoginPage;