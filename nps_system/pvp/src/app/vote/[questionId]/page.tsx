"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/supabase/client";
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Rating,
    TextField,
    Paper,
    Zoom,
    Fade,
    Stack,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";


export default function VotePage() {
    const { questionId } = useParams();
    const router = useRouter();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ratingValue, setRatingValue] = useState(0);
    const [comment, setComment] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [binaryOptions, setBinaryOptions] = useState(null);

    useEffect(() => {
        async function fetchQuestionData() {
            if (!questionId || typeof questionId !== "string") return;

            setLoading(true);

            const { data, error } = await supabase
                .from("questions")
                .select("*, entries(*)")
                .eq("id", questionId)
                .maybeSingle();

            if (error || !data) {
                setLoading(false);
                return;
            }

            setQuestion(data);

            if (data.entries && Array.isArray(data.entries)) {
                const positive = data.entries.find((e) => e.value === "positive");
                const negative = data.entries.find((e) => e.value === "negative");

                if (positive && negative) {
                    setBinaryOptions({ positive, negative });
                }
            }

            setLoading(false);
        }

        fetchQuestionData();
    }, [questionId]);

    const handleRatingSubmit = async () => {
        if (!ratingValue || !question || cancelled || submitted) return;

        const ratingEntry = question.entries.find((e) => e.value === "rating");
        if (!ratingEntry) return;

        const { error } = await supabase.from("answers").insert({
            question_id: question.id,
            entry: ratingEntry.id,
            rating: ratingValue,
            input: comment || null,
            ispositive: null,
        });

        if (!error) setSubmitted(true);
    };

    const handleTextSubmit = async () => {
        if (!comment.trim() || !question || cancelled || submitted) return;

        const textEntry = question.entries.find((e) => e.value === "text");
        if (!textEntry) return;

        const { error } = await supabase.from("answers").insert({
            question_id: question.id,
            entry: textEntry.id,
            input: comment.trim(),
            ispositive: null,
            rating: null,
        });

        if (!error) setSubmitted(true);
    };

    const handleCancel = () => {
        setCancelled(true);
    };

    if (loading) {
        return (
            <Box sx={{ mt: 10, textAlign: "center" }}>
                <CircularProgress size={80} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Loading feedback...
                </Typography>
            </Box>
        );
    }

    if (!question) {
        return (
            <Box sx={{ mt: 10, textAlign: "center" }}>
                <Typography variant="h6">
                    Invalid or expired question link.
                </Typography>
            </Box>
        );
    }

    if (question.type === "rating") {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#f5f5f5", px: 2 }}>
                <Zoom in timeout={600}>
                    <Paper elevation={10} sx={{ p: 4, maxWidth: 550, width: "100%", textAlign: "center", borderRadius: 3 }}>
                        {!submitted && !cancelled ? (
                            <>
                                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>{question.description}</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, my: 3, py: 2, borderRadius: 2, backgroundColor: "#6320EE" }}>
                                    <StarIcon sx={{ fontSize: 40, color: "white" }} />
                                    <Typography variant="h4" sx={{ fontWeight: "bold", color: "white" }}>Star Rating</Typography>
                                </Box>
                                <Rating value={ratingValue} onChange={(_, v) => setRatingValue(v || 0)} max={5} icon={<StarIcon sx={{ color: "#6320EE" }} />} emptyIcon={<StarBorderIcon />} size="large" sx={{ fontSize: "2rem", mb: 1 }} />
                                <Typography variant="h6" color="primary" fontWeight={600}>{ratingValue}/5</Typography>
                                <TextField label="Additional Comments (Optional)" multiline rows={4} value={comment} onChange={(e) => setComment(e.target.value)} fullWidth variant="outlined" sx={{ mb: 3 }} />
                                <Stack direction="row" spacing={2} justifyContent="center">
                                    <Button variant="contained" onClick={handleRatingSubmit} disabled={!ratingValue} startIcon={<CheckCircleIcon />} sx={{ backgroundColor: "#6320EE" }}>Submit Rating</Button>
                                    <Button variant="contained" color="error" onClick={handleCancel}>Cancel Submission</Button>
                                </Stack>
                            </>
                        ) : submitted ? (
                            <Fade in timeout={500}>
                                <Box>
                                    <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                                    <Typography variant="h4" fontWeight={600}>Thank You!</Typography>
                                    <Typography>Your feedback has been submitted successfully.</Typography>
                                </Box>
                            </Fade>
                        ) : (
                            <Fade in timeout={500}>
                                <Box>
                                    <Typography variant="h4" color="error" fontWeight={600}>Submission Cancelled</Typography>
                                    <Typography>Your feedback has not been submitted.</Typography>
                                </Box>
                            </Fade>
                        )}
                    </Paper>
                </Zoom>
            </Box>
        );
    }

    if (question.type === "text") {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: "#f5f5f5",
                    px: 2,
                }}
            >
                <Zoom in timeout={600}>
                    <Paper
                        elevation={10}
                        sx={{
                            p: 4,
                            maxWidth: 550,
                            width: "100%",
                            textAlign: "center",
                            borderRadius: 3,
                            overflow: "hidden",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                        }}
                    >
                        {!submitted && !cancelled ? (
                            <>
                                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                    You're submitting a:
                                </Typography>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 2,
                                        my: 3,
                                        py: 2,
                                        borderRadius: 2,
                                        backgroundColor: "#0288d1",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <Typography sx={{ fontSize: 30, color: "white" }}>📝</Typography>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: "bold",
                                            textTransform: "uppercase",
                                            color: "white",
                                        }}
                                    >
                                        Text Response
                                    </Typography>
                                </Box>

                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                    Question:
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 3 }}>
                                    {question.description}
                                </Typography>

                                <Typography variant="h6" gutterBottom>
                                    Write your answer below:
                                </Typography>

                                <TextField
                                    label="Your Answer"
                                    multiline
                                    rows={6}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    sx={{ mb: 3 }}
                                />

                                <Stack spacing={2} alignItems="center">
                                    <Button
                                        variant="contained"
                                        onClick={async () => {
                                            if (!comment.trim()) return;
                                            const textEntry = question.entries.find((e) => e.value === "text");
                                            if (!textEntry) return;

                                            const { error } = await supabase.from("answers").insert({
                                                question_id: question.id,
                                                entry: textEntry.id,
                                                input: comment.trim(),
                                                ispositive: null,
                                                rating: null,
                                            });

                                            if (!error) setSubmitted(true);
                                        }}
                                        disabled={!comment.trim()}
                                        sx={{
                                            backgroundColor: "#0288d1",
                                            py: 1.5,
                                            px: 4,
                                            borderRadius: 6,
                                            fontWeight: 600,
                                            fontSize: 16,
                                            "&:hover": {
                                                backgroundColor: "#026aa7",
                                            },
                                        }}
                                        startIcon={<CheckCircleIcon />}
                                    >
                                        Submit Answer
                                    </Button>

                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => setCancelled(true)}
                                        sx={{
                                            py: 1.5,
                                            px: 4,
                                            borderRadius: 6,
                                            fontWeight: 600,
                                            fontSize: 16,
                                        }}
                                    >
                                        Cancel Submission
                                    </Button>
                                </Stack>
                            </>
                        ) : cancelled ? (
                            <Fade in timeout={500}>
                                <Box>
                                    <Typography variant="h4" color="error" fontWeight={600} gutterBottom>
                                        Submission Cancelled
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 3 }}>
                                        Your feedback has not been submitted.
                                    </Typography>
                                </Box>
                            </Fade>
                        ) : (
                            <Fade in timeout={500}>
                                <Box>
                                    <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                                    <Typography variant="h4" fontWeight={600} gutterBottom>
                                        Thank You!
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 3 }}>
                                        Your feedback has been submitted successfully.
                                    </Typography>
                                </Box>
                            </Fade>
                        )}
                    </Paper>
                </Zoom>
            </Box>
        );
    }


    return (
        <Box sx={{ maxWidth: 700, mx: "auto", mt: 8, px: 2, textAlign: "center" }}>
            <Typography variant="h4" sx={{ mb: 6, fontWeight: 600 }}>{question.description}</Typography>
            {binaryOptions ? (
                <Stack direction="row" spacing={5} justifyContent="center">
                    <Button variant="contained" color="success" onClick={() => router.push(`/entry/${question.id}/${binaryOptions.positive.id}`)}>👍 Positive</Button>
                    <Button variant="contained" color="error" onClick={() => router.push(`/entry/${question.id}/${binaryOptions.negative.id}`)}>👎 Negative</Button>
                </Stack>
            ) : (
                <Typography>No binary options found.</Typography>
            )}
        </Box>
    );
}