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

type Entry = {
    id: string;
    value: string;
    question_id: string;
};

type Question = {
    id: string;
    description: string;
    type: "binary" | "rating";
    entries: Entry[];
};

export default function VotePage() {
    const { questionId } = useParams();
    const router = useRouter();
    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [ratingValue, setRatingValue] = useState<number | null>(0);
    const [comment, setComment] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [binaryOptions, setBinaryOptions] = useState<{
        positive: Entry;
        negative: Entry;
    } | null>(null);

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

            if (data.type === "binary") {
                const positive = data.entries?.find((e) => e.value === "positive");
                const negative = data.entries?.find((e) => e.value === "negative");

                if (positive && negative) {
                    setBinaryOptions({ positive, negative });
                }
            }

            setLoading(false);
        }

        fetchQuestionData();
    }, [questionId]);

    const handleRatingSubmit = async () => {
        if (!ratingValue || !question) return;

        const ratingEntry = question.entries.find((e) => e.value === "rating");
        if (!ratingEntry) return;

        const { error } = await supabase.from("answers").insert({
            question_id: question.id,
            entry: ratingEntry.id,
            rating: ratingValue,
            input: comment || null,
            ispositive: null,
        });

        if (error) {
            console.error("Failed to submit rating:", error);
            alert("Submission failed");
        } else {
            setSubmitted(true);
        }
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
                        {!submitted ? (
                            <>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                    {question.description}
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
                                        backgroundColor: "#6320EE",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <StarIcon sx={{ fontSize: 40, color: "white" }} />
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: "bold",
                                            textTransform: "uppercase",
                                            color: "white",
                                            letterSpacing: 1,
                                        }}
                                    >
                                        Star Rating
                                    </Typography>
                                </Box>

                                <Box sx={{ my: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        How would you rate this?
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            mb: 3,
                                        }}
                                    >
                                        <Rating
                                            value={ratingValue}
                                            onChange={(_, newValue) =>
                                                setRatingValue(newValue || 0)
                                            }
                                            max={5}
                                            icon={
                                                <StarIcon fontSize="inherit" sx={{ color: "#6320EE" }} />
                                            }
                                            emptyIcon={<StarBorderIcon fontSize="inherit" />}
                                            size="large"
                                            sx={{ fontSize: "2rem", mb: 1 }}
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
                                        sx={{ mb: 3 }}
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={handleRatingSubmit}
                                        sx={{
                                            backgroundColor: "#6320EE",
                                            py: 1.5,
                                            px: 4,
                                            borderRadius: 6,
                                            fontWeight: 600,
                                            fontSize: 16,
                                            "&:hover": {
                                                backgroundColor: "#4e10ce",
                                            },
                                        }}
                                    >
                                        Submit Rating
                                    </Button>
                                </Box>
                            </>
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
            <Typography
                variant="h4"
                sx={{
                    mb: 6,
                    fontWeight: 600,
                    fontSize: { xs: "1.8rem", md: "2.2rem" },
                }}
            >
                {question.description}
            </Typography>

            {binaryOptions ? (
                <Stack direction="row" spacing={5} justifyContent="center">
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: 18,
                            fontWeight: 600,
                            borderRadius: 3,
                            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                            textTransform: "uppercase",
                        }}
                        onClick={() =>
                            router.push(`/entry/${question.id}/${binaryOptions.positive.id}`)
                        }
                    >
                        👍 Positive
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        size="large"
                        sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: 18,
                            fontWeight: 600,
                            borderRadius: 3,
                            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                            textTransform: "uppercase",
                        }}
                        onClick={() =>
                            router.push(`/entry/${question.id}/${binaryOptions.negative.id}`)
                        }
                    >
                        👎 Negative
                    </Button>
                </Stack>
            ) : (
                <Typography>No binary options found.</Typography>
            )}
        </Box>
    );
}
