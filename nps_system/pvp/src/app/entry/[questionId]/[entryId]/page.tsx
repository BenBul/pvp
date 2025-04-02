"use client"

import { useParams } from 'next/navigation'
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/supabase/client";
import { Box, Typography, Button, Alert, Paper, CircularProgress } from '@mui/material';

export default function EntryPage() {
    const { questionId, entryId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isPositive, setIsPositive] = useState(false);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [cancelled, setCancelled] = useState(false);
    const timerRef = useRef<number>(0);
    const submittedRef = useRef(false);

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
        if (!success || !cancelled) window.addEventListener('beforeunload', handleAutoSubmit);

        return () => {
            window.removeEventListener('beforeunload', handleAutoSubmit);
        };
    },[success, cancelled, handleAutoSubmit]);

    const handleCancel = () => {
        if (timerRef.current) {
            window.clearInterval(timerRef.current);
        }
        setCancelled(true);
    };

    const statusColor = isPositive ? 'success' : 'error';
    const statusText = isPositive ? 'POSITIVE REVIEW' : 'NEGATIVE REVIEW';

    if (isLoading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <CircularProgress size={80} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, maxWidth: 600, margin: '0 auto' }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                {!success && !cancelled ? (
                    <>
                        <Typography variant="h5" gutterBottom>
                            You're submitting a:
                        </Typography>
                        <Typography
                            variant="h4"
                            color={statusColor}
                            sx={{
                                fontWeight: 'bold',
                                mb: 3,
                                textTransform: 'uppercase'
                            }}
                        >
                            {statusText}
                        </Typography>

                        <Typography variant="h6" gutterBottom>
                            Time remaining: {countdown} seconds
                        </Typography>

                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleCancel}
                            sx={{ mt: 3 }}
                            size="large"
                        >
                            Cancel Submission
                        </Button>
                    </>
                ) : cancelled ? (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Submission cancelled.
                    </Alert>
                ) : (
                    <Box>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Answer submitted successfully!
                        </Alert>
                        <Typography variant="h5" gutterBottom>
                            Your submission was:
                        </Typography>
                        <Typography
                            variant="h4"
                            color={statusColor}
                            sx={{
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}
                        >
                            {statusText}
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}