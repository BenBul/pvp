'use client';
import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Divider,
    IconButton,
    Tooltip,
    Collapse,
    Link
} from '@mui/material';
import {
    QrCode as QrCodeIcon,
    Delete as DeleteIcon,
    Share as ShareIcon,
    ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import SendSurveyForm from './SendSurveyForm';

type Entry = {
    id: string;
    created_at: string;
    question_id: string;
    value: string;
    url: string;
};

type Question = {
    id: string;
    created_at: string;
    survey_id: string;
    description: string;
    type: string;
    short_code?: string;
    entries: Entry[];
};

type QuestionItemProps = {
    question: Question;
    isLast: boolean;
    showDivider: boolean;
    onOpenQrDialog: (url: string, type: 'positive' | 'negative' | 'rating' | 'text') => void;
    onDeleteQuestion: (questionId: string, description: string) => void;
};

const QuestionItem: React.FC<QuestionItemProps> = ({
                                                       question,
                                                       isLast,
                                                       showDivider,
                                                       onOpenQrDialog,
                                                       onDeleteQuestion
                                                   }) => {
    const [showShare, setShowShare] = useState(false);
    const [copied, setCopied] = useState(false);

    const positiveEntry = question.entries?.find(e => e.value === "positive");
    const negativeEntry = question.entries?.find(e => e.value === "negative");
    const ratingEntry = question.entries?.find(e => e.value === "rating");
    const textEntry = question.entries?.find(e => e.value === "text");

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const link = `http://localhost:3000/vote/${question.id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleCreateShortCode = () => {
        alert("Short code creation logic not implemented yet.");
    };

    return (
        <>
            {showDivider && <Divider sx={{ mx: 0 }} />}
            <Box
                sx={{
                    p: 4,
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
                    borderBottom: isLast ? 'none' : null
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight="medium" gutterBottom>
                                {question.description}
                            </Typography>
                            <Tooltip title="Delete question">
                                <IconButton
                                    size="small"
                                    color="error"
                                    sx={{ ml: 1 }}
                                    onClick={() => onDeleteQuestion(question.id, question.description)}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            Created: {formatDate(question.created_at)}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {positiveEntry && (
                            <Button
                                onClick={() => onOpenQrDialog(positiveEntry.url, 'positive')}
                                variant="outlined"
                                color="success"
                                size="small"
                                startIcon={<QrCodeIcon />}
                            >
                                Positive QR
                            </Button>
                        )}

                        {negativeEntry && (
                            <Button
                                onClick={() => onOpenQrDialog(negativeEntry.url, 'negative')}
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<QrCodeIcon />}
                            >
                                Negative QR
                            </Button>
                        )}

                        {ratingEntry && (
                            <Button
                                onClick={() => onOpenQrDialog(ratingEntry.url, 'rating')}
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={<QrCodeIcon />}
                            >
                                Rating QR
                            </Button>
                        )}
                        {textEntry && (
                    <Button
                        onClick={() => onOpenQrDialog(textEntry.url, 'text')}
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<QrCodeIcon />}
                    >
                        Text QR
                    </Button>
                )}
                    </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ShareIcon />}
                        onClick={() => setShowShare((prev) => !prev)}
                    >
                        Share Question
                    </Button>

                    <Collapse in={showShare}>
                        <Box sx={{ mt: 2 }}>

                            <SendSurveyForm
                                questionId={question.id}
                                shortCode={question.short_code || null}
                                onRequestShortCode={handleCreateShortCode}
                            />

                        </Box>
                    </Collapse>
                </Box>
            </Box>
        </>
    );
};

export default QuestionItem;
