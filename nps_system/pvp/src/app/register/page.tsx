"use client";

import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/navigation';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Avatar, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { supabase } from '@/supabase/client';
import CircularProgress from '@mui/material/CircularProgress';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (email:string , password: string) => {
        setRegisterError('');
        setIsLoading(true);

        if (password !== confirmPassword) {
            setRegisterError('Passwords do not match')
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setRegisterError('Password should be atleast 6 characters')
            setIsLoading(false);
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setRegisterError('Please enter a valid email address');
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (data.user) {
                router.push('/login');
            }
            if (error) {
                setRegisterError(error.message);
                setIsLoading(false);
                return;
            }
        } catch (error) {
            setRegisterError('An error occurred. Please try again.');
            console.error(error);
        }
    };

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setEmail(value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setPassword(value);
    };

    const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setConfirmPassword(value);
    }

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
                        Sign Up
                    </Typography>
                    {registerError && <Alert severity="error" className="mb-3">{registerError}</Alert>}
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
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Confirm Password"
                            type="password"
                            autoComplete="current-confirm-password"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            className='mb-5'
                        />
                        <Button onClick={() => handleSubmit(email, password)} sx={{ borderRadius: '15px'}} fullWidth variant="contained" color="secondary" disabled={!isFormValid}>
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up' }
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default RegisterPage;