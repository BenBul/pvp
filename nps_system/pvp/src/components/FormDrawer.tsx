import React, { useState } from 'react';
import { Drawer, TextField, Typography, Box, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import 'bootstrap/dist/css/bootstrap.min.css';

interface FormDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const FormDrawer: React.FC<FormDrawerProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [apiResponse, setApiResponse] = useState('');

    const handleSubmit = async () => {
        try {
            const response = await fakeApiCall(name, description);
            setApiResponse(response.message);
            onClose(); // Close the drawer on success
        } catch (error) {
            setApiResponse('An error occurred. Please try again.');
        }
    };

    return (
        <Drawer anchor="right" open={isOpen} onClose={onClose} variant="persistent">
            <Box
                sx={{ width: { xs: 300, sm: 300, md: 450, lg: 650 }, padding: 3 }}
                role="presentation"
            >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" gutterBottom className="text-center text-h2 mt-1">
                        Add a New Question
                    </Typography>
                    <IconButton onClick={onClose} color="primary" size="large">
                        <CloseIcon fontSize="large" />
                    </IconButton>
                </Box>
                <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" mt={5} gap={3}>
                    <TextField
                        label="Name"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{ maxWidth: 450 }}
                    />
                    <TextField
                        label="Description"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        multiline
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        sx={{ maxWidth: 450 }}
                    />
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Submit
                    </Button>
                    {apiResponse && <Typography variant="body1" color="textSecondary">{apiResponse}</Typography>}
                </Box>
            </Box>
        </Drawer>
    );
};

// Mock API call function
const fakeApiCall = async (name: string, description: string) => {
    return new Promise<{ message: string }>((resolve, reject) => {
        setTimeout(() => {
            if (name && description) {
                resolve({ message: 'Form submitted successfully!' });
            } else {
                reject(new Error('Invalid input'));
            }
        }, 1000);
    });
};

export default FormDrawer;