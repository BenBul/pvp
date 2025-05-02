"use client"

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/supabase/client";
import { Box, Typography, Button, TextField, Paper, CircularProgress, Fade, Zoom, Rating } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

export default function EntryPage() {
    const {questionId, entryId} = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [entryType, setEntryType] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [progress, setProgress] = useState(100);
    const timerRef = useRef(0);
    const submittedRef = useRef(false);
    const router = useRouter();
    const [ratingValue, setRatingValue] = useState<number | null>(0);
    const [comment, setComment] = useState<string>("");

    useEffect(() => {
        const isQuestionDeleted = async () => {
            const {data} = await supabase
                .from('questions')
                .select('is_deleted')
                .eq('id', questionId)
                .maybeSingle();

            if (!data || data.is_deleted) {
                router.push('/entry/404');
            }
        };

        const fetchEntryData = async () => {
            const {data, error} = await supabase
                .from('entries')
                .select('value')
                .eq('id', entryId)
                .single();

            if (error) {
                router.push('/entry/404');
                return;
            }

            // Set entry type based on the value from the database
            setEntryType(data?.value);
            setIsLoading(false);
        };

        isQuestionDeleted();
        fetchEntryData();
    }, [entryId, questionId, router]);

    useEffect(() => {
        // Only set up timer for positive/negative entries, not for rating
        if (isLoading || success || cancelled || entryType === "rating") return;

        // Timer for countdown (only for positive/negative)
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
    }, [isLoading, success, cancelled, entryType]);

    const handleAutoSubmit = async () => {
        if (success || cancelled || submittedRef.current) return;

        submittedRef.current = true;
        try {
            const {error} = await supabase
                .from('answers')
                .insert({
                    question_id: questionId,
                    ispositive: entryType === "positive",
                    entry: entryId,
                });

            if (error) throw error;
            setSuccess(true);
        } catch (error) {
            submittedRef.current = false;
            console.error("Submission error:", error);
        }
    };

    const handleRatingSubmit = async () => {
        if (success || cancelled || submittedRef.current) return;

        submittedRef.current = true;
        try {
            const {error} = await supabase
                .from('answers')
                .insert({
                    question_id: questionId,
                    rating: ratingValue,
                    input: comment,
                    entry: entryId,
                    ispositive: null,
                });

            if (error) throw error;
            setSuccess(true);
        } catch (error) {
            submittedRef.current = false;
            console.error("Submission error:", error);
        }
    };

    useEffect(() => {
        // Only for positive/negative entries
        if (entryType !== "positive" && entryType !== "negative") return;

        if (!success && !cancelled) window.addEventListener('beforeunload', handleAutoSubmit);

        return () => {
            window.removeEventListener('beforeunload', handleAutoSubmit);
        };
    }, [success, cancelled, entryType]);

    const handleCancel = () => {
        if (timerRef.current) {
            window.clearInterval(timerRef.current);
        }
        setCancelled(true);
    };

    // Color settings
    const getStatusBgColor = () => {
        if (entryType === "positive") return 'success.main';
        if (entryType === "negative") return 'error.main';
        if (entryType === "rating") return 'primary.main';
        return 'primary.main';
    };

    const getStatusText = () => {
        if (entryType === "positive") return 'POSITIVE REVIEW';
        if (entryType === "negative") return 'NEGATIVE REVIEW';
        if (entryType === "rating") return 'STAR RATING';
        return '';
    };

    const getStatusIcon = () => {
        if (entryType === "positive") return <ThumbUpIcon sx={{fontSize: 40, color: 'white'}}/>;
        if (entryType === "negative") return <ThumbDownIcon sx={{fontSize: 40, color: 'white'}}/>;
        if (entryType === "rating") return <StarIcon sx={{fontSize: 40, color: 'white'}}/>;
        return null;
    };

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
                <CircularProgress size={80} thickness={4}/>
                <Typography
                    variant="h6"
                    sx={{mt: 3, fontWeight: 500, opacity: 0.8}}
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
                            {/* Progress bar only for positive/negative entries */}
                            {(entryType === "positive" || entryType === "negative") && (
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: 6,
                                    width: `${progress}%`,
                                    bgcolor: getStatusBgColor(),
                                    transition: 'width 1s linear'
                                }}/>
                            )}

                            <Box sx={{px: 2, pt: 2}}>
                                <Typography variant="h5" gutterBottom sx={{fontWeight: 600}}>
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
                                        backgroundColor: getStatusBgColor(),
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {getStatusIcon()}
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            color: 'white',
                                            letterSpacing: 1
                                        }}
                                    >
                                        {getStatusText()}
                                    </Typography>
                                </Box>

                                {/* Rating UI for rating type entries */}
                                {entryType === "rating" && (
                                    <Box sx={{my: 3}}>
                                        <Typography variant="h6" gutterBottom>
                                            How would you rate this?
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                mb: 3
                                            }}
                                        >
                                            <Rating
                                                name="customized-rating"
                                                value={ratingValue}
                                                precision={1}
                                                onChange={(event, newValue) => {
                                                    setRatingValue(newValue);
                                                }}
                                                max={5}
                                                icon={<StarIcon fontSize="inherit" sx={{color: getStatusBgColor()}}/>}
                                                emptyIcon={<StarBorderIcon fontSize="inherit"/>}
                                                size="large"
                                                sx={{fontSize: '2rem', mb: 1}}
                                            />

                                            <Typography variant="h6" color="primary" fontWeight={600}>
                                                {ratingValue}/5
                                            </Typography>
                                        </Box>

                                        <TextField
                                            label="Additional Comments (Optional)"
                                            multiline
                                            rows={4}
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            fullWidth
                                            variant="outlined"
                                            sx={{mb: 3}}
                                        />

                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleRatingSubmit}
                                            startIcon={<CheckCircleIcon/>}
                                            sx={{
                                                py: 1.5,
                                                px: 4,
                                                borderRadius: 6,
                                                textTransform: 'none',
                                                fontSize: 16,
                                                fontWeight: 600,
                                                mb: 2,
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                                '&:hover': {
                                                    boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                                                    transform: 'translateY(-2px)'
                                                },
                                                transition: 'all 0.3s ease'
                                            }}
                                            size="large"
                                        >
                                            Submit Rating
                                        </Button>
                                    </Box>
                                )}

                                {/* Countdown only for positive/negative entries */}
                                {(entryType === "positive" || entryType === "negative") && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1,
                                            mb: 3,
                                            animation: countdown <= 2 ? 'pulse 1s infinite' : 'none',
                                            '@keyframes pulse': {
                                                '0%': {opacity: 1},
                                                '50%': {opacity: 0.7},
                                                '100%': {opacity: 1}
                                            }
                                        }}
                                    >
                                        <Typography variant="h6" fontWeight={600}>
                                            Auto-submitting in:
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            color={getStatusBgColor()}
                                            fontWeight={700}
                                        >
                                            {countdown} seconds
                                        </Typography>
                                    </Box>
                                )}

                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleCancel}
                                    startIcon={<CancelIcon/>}
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
                            <Box sx={{p: 2}}>
                                <CancelIcon
                                    color="warning"
                                    sx={{fontSize: 80, opacity: 0.8, mb: 2}}
                                />
                                <Typography variant="h4" color="warning.main" fontWeight={600} gutterBottom>
                                    Submission Cancelled
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{mb: 3}}>
                                    Your review has not been submitted.
                                </Typography>
                            </Box>
                        </Fade>
                    ) : (
                        <Fade in={true} timeout={800}>
                            <Box sx={{p: 2}}>
                                <CheckCircleIcon
                                    color="success"
                                    sx={{fontSize: 80, mb: 2}}
                                />
                                <Typography variant="h4" color="success.main" fontWeight={600} gutterBottom>
                                    Thank You!
                                </Typography>
                                <Typography variant="body1" sx={{mb: 4}}>
                                    Your review has been submitted successfully.
                                </Typography>

                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: getStatusBgColor(),
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

                                    {entryType === "rating" ? (
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            flexDirection: 'column'
                                        }}>
                                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                <StarIcon sx={{fontSize: 30, color: 'white', mr: 1}}/>
                                                <Typography
                                                    variant="h5"
                                                    color="white"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    {ratingValue}/5 RATING
                                                </Typography>
                                            </Box>

                                            {comment && (
                                                <Typography
                                                    variant="body2"
                                                    color="white"
                                                    sx={{
                                                        mt: 1,
                                                        maxHeight: '60px',
                                                        overflow: 'auto',
                                                        textAlign: 'center',
                                                        px: 2
                                                    }}
                                                >
                                                    "{comment}"
                                                </Typography>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                                            {getStatusIcon()}
                                            <Typography
                                                variant="h5"
                                                color="white"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                {getStatusText()}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Fade>
                    )}
                </Paper>
            </Zoom>
        </Box>
    );
}