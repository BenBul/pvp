import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const QRCodeInvalidPage = () => {
    return (
        <Container
            maxWidth="sm"
            sx={{
                position: 'relative',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Box
                sx={{
                    textAlign: 'center',
                    backgroundColor: 'background.default',
                    boxShadow: 3,
                    borderRadius: 2,
                    p: 4,
                }}
            >
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontWeight: 'bold',
                        color: 'primary.main',
                    }}
                >
                    QR Code is invalid 
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                        mb: 3,
                    }}
                >
                    The scanned QR code is no longer valid. Please try scanning a different code or contact support for assistance.
                </Typography>
            </Box>
        </Container>
    );
};

export default QRCodeInvalidPage;