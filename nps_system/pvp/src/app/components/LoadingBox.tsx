import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingBoxProps {
    message?: string;
}

const LoadingBox: React.FC<LoadingBoxProps> = ({ message = 'Loading...' }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
            }}
        >
            <CircularProgress
                size={80}
                thickness={4}
                sx={{
                    color: 'primary.main',
                    mb: 2,
                }}
            />
            <Typography variant="h6" color="text.secondary">
                {message}
            </Typography>
        </Box>
    );
};

export default LoadingBox;