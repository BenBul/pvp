"use client"

import { useParams } from 'next/navigation'
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/supabase/client";
import { Box, Typography, Button, Alert, Paper, CircularProgress, Fade, Zoom } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

export default function EntryPage() {
    const { questionId, entryId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isPositive, setIsPositive] = useState(false);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [cancelled, setCancelled] = useState(false);
    const timerRef = useRef(0);
    const submittedRef = useRef(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const fetchEntryData = async () => {
            const { data, error } = await supabase
                .from('entries')
                .select('value')
                .eq('id', entryId)
                .single();

            if (error) throw error;
            setIsPositive(data?.value === "positive");
            setIsLoading(false);
        };
        fetchEntryData();
    }, [entryId]);

    useEffect(() => {
        if (isLoading || success || cancelled) return;

        // Timer for countdown
        timerRef.current = window.setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) {
                        window.clearInterval(timerRef.current);
                    }
                    if (!cancelled && !submittedRef.current) {
                        handleAutoSubmit();
                    }
                    return 0;
                }
                return prev - 1;
            });

            // Update progress bar
            setProgress((prev) => Math.max(prev - 20, 0));
        }, 1000);

        return () => {
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
            }
        };
    }, [isLoading, success, cancelled]);

    const handleAutoSubmit = async () => {
        if (success || cancelled || submittedRef.current) return;

        submittedRef.current = true;
        try {
            const { error } = await supabase
                .from('answers')
                .insert({
                    question_id: questionId,
                    ispositive: isPositive,
                    entry: entryId,
                });

            if (error) throw error;
            setSuccess(true);
        } catch (error) {
            submittedRef.current = false;
            console.error("Submission error:", error);
        }
    };

    useEffect(() => {
        if (!success && !cancelled) window.addEventListener('beforeunload', handleAutoSubmit);

        return () => {
            window.removeEventListener('beforeunload', handleAutoSubmit);
        };
    }, [success, cancelled]);

    const handleCancel = () => {
        if (timerRef.current) {
            window.clearInterval(timerRef.current);
        }
        setCancelled(true);
    };

    // Color settings
    const statusBgColor = isPositive ? 'success.main' : 'error.main';
    const statusText = isPositive ? 'POSITIVE REVIEW' : 'NEGATIVE REVIEW';

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    bgcolor: '#f5f5f5'
                }}
            >
                <CircularProgress size={80} thickness={4} />
                <Typography
                    variant="h6"
                    sx={{ mt: 3, fontWeight: 500, opacity: 0.8 }}
                >
                    Loading your review...
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: '#f5f5f5',
                padding: 2
            }}
        >
            <Zoom in={true} timeout={700}>
                <Paper
                    elevation={10}
                    sx={{
                        p: 4,
                        maxWidth: 550,
                        width: '100%',
                        textAlign: 'center',
                        borderRadius: 3,
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}
                >
                    {!success && !cancelled ? (
                        <>
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: 6,
                                width: `${progress}%`,
                                bgcolor: statusBgColor,
                                transition: 'width 1s linear'
                            }} />

                            <Box sx={{ px: 2, pt: 2 }}>
                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                                    You're submitting a:
                                </Typography>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 2,
                                        my: 3,
                                        py: 2,
                                        borderRadius: 2,
                                        backgroundColor: statusBgColor,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {isPositive ? (
                                        <ThumbUpIcon sx={{ fontSize: 40, color: 'white' }} />
                                    ) : (
                                        <ThumbDownIcon sx={{ fontSize: 40, color: 'white' }} />
                                    )}
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            color: 'white',
                                            letterSpacing: 1
                                        }}
                                    >
                                        {statusText}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1,
                                        mb: 3,
                                        animation: countdown <= 2 ? 'pulse 1s infinite' : 'none',
                                        '@keyframes pulse': {
                                            '0%': { opacity: 1 },
                                            '50%': { opacity: 0.7 },
                                            '100%': { opacity: 1 }
                                        }
                                    }}
                                >
                                    <Typography variant="h6" fontWeight={600}>
                                        Auto-submitting in:
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        color={statusBgColor}
                                        fontWeight={700}
                                    >
                                        {countdown} seconds
                                    </Typography>
                                </Box>

                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleCancel}
                                    startIcon={<CancelIcon />}
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        px: 4,
                                        borderRadius: 6,
                                        textTransform: 'none',
                                        fontSize: 16,
                                        fontWeight: 600,
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                        '&:hover': {
                                            boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                    size="large"
                                >
                                    Cancel Submission
                                </Button>
                            </Box>
                        </>
                    ) : cancelled ? (
                        <Fade in={true} timeout={800}>
                            <Box sx={{ p: 2 }}>
                                <CancelIcon
                                    color="warning"
                                    sx={{ fontSize: 80, opacity: 0.8, mb: 2 }}
                                />
                                <Typography variant="h4" color="warning.main" fontWeight={600} gutterBottom>
                                    Submission Cancelled
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                    Your review has not been submitted.
                                </Typography>
                            </Box>
                        </Fade>
                    ) : (
                        <Fade in={true} timeout={800}>
                            <Box sx={{ p: 2 }}>
                                <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 80, mb: 2 }}
                                />
                                <Typography variant="h4" color="success.main" fontWeight={600} gutterBottom>
                                    Thank You!
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 4 }}>
                                    Your review has been submitted successfully.
                                </Typography>

                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: statusBgColor,
                                        borderRadius: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <Typography variant="subtitle1" fontWeight={500} color="white">
                                        Your submission was:
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        {isPositive ? (
                                            <ThumbUpIcon sx={{ fontSize: 30, color: 'white' }} />
                                        ) : (
                                            <ThumbDownIcon sx={{ fontSize: 30, color: 'white' }} />
                                        )}
                                        <Typography
                                            variant="h5"
                                            color="white"
                                            sx={{
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            {statusText}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Fade>
                    )}
                </Paper>
            </Zoom>
        </Box>
    );
}