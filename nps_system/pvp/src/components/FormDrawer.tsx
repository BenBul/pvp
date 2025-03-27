import React, { useState } from 'react';
import {
    Drawer,
    TextField,
    Typography,
    Box,
    IconButton,
    Button,
    MenuItem,
    Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import 'bootstrap/dist/css/bootstrap.min.css';

interface FormDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const FormDrawer: React.FC<FormDrawerProps> = ({ isOpen, onClose }) => {
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState('text');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async () => {
        if (!questionText || !questionType) {
            setErrorMessage('All fields must be filled out.');
            return;
        }

        try {
            const qrCode = `QR-${Math.random().toString(36).substring(2, 8)}`;
            const response = await fakeApiCall(questionText, questionType, qrCode);
            setSuccessMessage(response.message);
            setErrorMessage('');
            setTimeout(() => {
                setSuccessMessage('');
                onClose();
                setQuestionText('');
                setQuestionType('text');
            }, 2500);
        } catch (error) {
            setSuccessMessage('');
            setErrorMessage('An error occurred. Please try again.');
        }
    };

    return (
        <Drawer anchor="right" open={isOpen} onClose={onClose} variant="persistent">
            <Box
                sx={{ width: { xs: 300, sm: 300, md: 450 }, padding: 3 }}
                role="presentation"
            >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                        Add a New Question
                    </Typography>
                    <IconButton onClick={onClose} color="primary">
                        <CloseIcon fontSize="large" />
                    </IconButton>
                </Box>

                <Box display="flex" flexDirection="column" mt={4} gap={3}>
                    <TextField
                        label="Question Text"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={5}
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                    />

                    <TextField
                        label="Question Type"
                        select
                        fullWidth
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value)}
                    >
                        <MenuItem value="text">Text</MenuItem>
                        <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
                        <MenuItem value="boolean">Yes/No</MenuItem>
                    </TextField>

                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Submit
                    </Button>

                    {successMessage && <Alert severity="success">{successMessage}</Alert>}
                    {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                </Box>
            </Box>
        </Drawer>
    );
};

const fakeApiCall = async (text: string, type: string, qrCode: string) => {
    return new Promise<{ message: string }>((resolve) => {
        setTimeout(() => {
            console.log('Question saved:', { text, type, qrCode });
            resolve({ message: 'Question added successfully!' });
        }, 1000);
    });
};

export default FormDrawer;