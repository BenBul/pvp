'use client';
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    IconButton,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
    open: boolean;
    onClose: () => void;
    questionId: string;
    onShortCodeCreated: (code: string) => void;
};

const ShortCodeModal: React.FC<Props> = ({ open, onClose, questionId, onShortCodeCreated }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = () => {
        setCode(Math.random().toString(36).substring(2, 8));
    };

    const handleSave = async () => {
        if (!code.trim()) {
            setError('Please enter a short code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/questions/${questionId}/shortcode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customCode: code.trim() })
            });

            const data = await res.json();

            if (!res.ok || !data.short_code) {
                setError('Failed to save short code.');
            } else {
                onShortCodeCreated(data.short_code);
                onClose();
            }
        } catch (err) {
            setError('Unexpected error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
                Create Short Code
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <TextField
                    label="Short code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.trim())}
                    fullWidth
                    margin="normal"
                />

                <Button onClick={handleGenerate} variant="outlined" size="small" sx={{ mt: 1 }}>
                    Generate Random Code
                </Button>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={loading || !code.trim()}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
                >
                    {loading ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShortCodeModal;