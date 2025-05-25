'use client';
import React, { useState, useEffect } from 'react';
import {
    TextField, Container, Typography, Box
} from '@mui/material';
import { getCachedName, getUserName, session, setCachedName, supabase } from '@/supabase/client';

const ProfilePage = () => {
    const [name, setName] = useState('');
    const [initialName, setInitialName] = useState('');
    const [nameError, setNameError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            const fetchedName = getCachedName() || (await getUserName());
            setInitialName(fetchedName);
            setName(fetchedName);
        };
        loadData();
    }, []);

    const validateName = (name: string): string => {
        if (name.length < 4 || name.length > 20) {
            return 'Name must be between 4 and 20 characters long.';
        }
        if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
            return 'Name can only contain letters, numbers, and spaces.';
        }
        return '';
    };

    const saveName = async () => {
        const error = validateName(name);
        if (error) {
            setNameError(error);
            return;
        }
        if (name === initialName) return;
        setNameError('');
        const { error: saveError } = await supabase
            .from('users')
            .update({ name })
            .eq('id', session?.user.id);
        if (!saveError) {
            setInitialName(name);
            setCachedName(name);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ marginTop: '5%', display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                    onBlur={saveName}
                    sx={{
                        borderRadius: 28,
                        bgcolor: '#f5f5f5',
                        '&:hover': { bgcolor: '#f0f0f0' },
                    }}
                />
            </Box>
        </Container>
    );
};

export default ProfilePage;