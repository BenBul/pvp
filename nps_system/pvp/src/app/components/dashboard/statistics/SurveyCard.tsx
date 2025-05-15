import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box, Tooltip, CircularProgress } from '@mui/material';
import NPSGauge from '../../NPSGauge';

interface SurveyCardProps {
    id: string;
    created_at: string;
    title: string;
    description?: string;
    score: number | null;
    isScoreLoading: boolean;
    ratingQuestionsCount: number;
    binaryQuestionsCount: number;
    totalAnswersCount: number;
    onClick: (id: string) => void;
}

const SurveyCard: React.FC<SurveyCardProps> = ({ 
    id, 
    title, 
    description, 
    score, 
    isScoreLoading,
    ratingQuestionsCount,
    binaryQuestionsCount,
    totalAnswersCount,
    onClick 
}) => {
    const getFeedbackType = (score: number) => {
        if (score <= -50) return 'Very Negative';
        if (score < 0) return 'Negative';
        if (score === 0) return 'Neutral';
        if (score < 50) return 'Positive';
        return 'Very Positive';
    };

    const getScoreColor = (score: number) => {
        if (score <= -50) return '#d32f2f'; 
        if (score < 0) return '#ff5252';    
        if (score === 0) return '#757575';  
        if (score < 50) return '#4caf50';   
        return '#2e7d32';                   
    };

    return (
        <Card sx={{ height: 200 }}> 
            <CardActionArea onClick={() => onClick(id)} sx={{ height: '100%' }}>
                <CardContent sx={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    height: '100%',
                    p: 3
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '60%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {title}
                        </Typography>
                        {description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {description.length > 100 ? `${description.substring(0, 100)}...` : description}
                            </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 'auto' }}>
                            <Typography variant="caption" color="text.secondary">
                                Questions: {ratingQuestionsCount + binaryQuestionsCount}
                                {ratingQuestionsCount > 0 && ` (${ratingQuestionsCount} rating)`}
                                {binaryQuestionsCount > 0 && ` (${binaryQuestionsCount} binary)`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Total Answers: {totalAnswersCount}
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        ml: 2
                    }}>
                        {isScoreLoading ? (
                            <CircularProgress size={60} />
                        ) : score !== null ? (
                            <Tooltip title={`Feedback Score: ${score} (${getFeedbackType(score)})`}>
                                <Box>
                                    <NPSGauge score={score} size="small" />
                                    <Typography 
                                        variant="caption" 
                                        align="center" 
                                        sx={{ 
                                            display: 'block', 
                                            fontWeight: 'bold',
                                            color: getScoreColor(score)
                                        }}
                                    >
                                        {getFeedbackType(score)}
                                    </Typography>
                                </Box>
                            </Tooltip>
                        ) : totalAnswersCount === 0 ? (
                            <Typography variant="body2" color="text.secondary" align="center">
                                No responses yet
                            </Typography>
                        ) : (
                            <Typography variant="body2" color="text.secondary" align="center">
                                Score unavailable
                            </Typography>
                        )}
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default SurveyCard;