'use client';
import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { cachedName, getUserName, session, supabase } from '@/supabase/client';

const ProfilePage = () => {
    const [name, setName] = useState('');
    const [initialName, setInitialName] = useState('');
    const [message, setMessage] = useState('');
    const [nameError, setNameError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            const name = cachedName || await getUserName();
            setInitialName(name);
            setName(name);
        };
        loadData();
    }, []);

    const handleSave = async () => {
        if (name === initialName) {
            return;
        }

        if(name.length < 4 || name.length > 20) {
            setNameError('Name must be between 4 and 20 characters long.');
            return;
        }
        setNameError('');

        const { error } = await supabase
            .from('users')
            .update({ name })
            .eq('id', session?.user.id);

        if (error) {
            setMessage('An error occurred while saving your name.');
        } else {
            setInitialName(name);
        }
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: '5%', display: 'flex', flexDirection: 'column', gap: '5rem' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Welcome to Your Profile!
                </Typography>
                <Typography variant="h6" color="text.primary">
                    Here you can view and update your personal information.
                </Typography>
                <Typography variant="h6" color="text.primary" sx={{ marginTop: '1rem' }}>
                    Form automatically saves your information.
                </Typography>
            </Box>
            <Box>
                <TextField
                    label="Name"
                    variant="outlined"
                    fullWidth
                    value={name}
                    error={!!nameError}
                    helperText={nameError}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleSave}
                    sx={{ 
                        borderRadius: 28,
                        bgcolor: '#f5f5f5',
                        '&:hover': {
                          bgcolor: '#f0f0f0'
                        }
                      }}
                />
                {message && (
                    <Typography variant="body1" style={{ marginTop: '1rem' }}>
                        {message}
                    </Typography>
                )}
            </Box>
        </Container>
    );
};

export default ProfilePage;