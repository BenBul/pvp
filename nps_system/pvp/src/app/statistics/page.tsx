'use client';
import { useRouter } from 'next/navigation';
import { Box, Typography, Grid } from '@mui/material';
import SurveyCard from '@/app/components/dashboard/statistics/SurveyCard';
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase/client';
import LoadingBox from '../components/LoadingBox';
import { calculateUnifiedSurveyScore } from './survey-scores/survey-scoring-utils';

interface SurveyData {
    id: string;
    created_at: string;
    title: string;
    description?: string;
    score: number | null;
    isScoreLoading: boolean;
    ratingQuestionsCount: number;
    binaryQuestionsCount: number;
    totalAnswersCount: number;
}

export default function StatisticsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [surveys, setSurveys] = useState<SurveyData[]>([]);

    const handleSurveyClick = (id: string) => {
        router.push(`/statistics/${id}`);
    };

    const fetchSurveyScores = async (surveysList: SurveyData[]) => {
        const updatedSurveys = [...surveysList];
        
        for (let i = 0; i < updatedSurveys.length; i++) {
            try {
                const surveyScore = await calculateUnifiedSurveyScore(updatedSurveys[i].id);
                
                updatedSurveys[i] = {
                    ...updatedSurveys[i],
                    score: surveyScore.score,
                    isScoreLoading: false,
                    ratingQuestionsCount: surveyScore.ratingQuestionsCount,
                    binaryQuestionsCount: surveyScore.binaryQuestionsCount,
                    totalAnswersCount: surveyScore.totalAnswersCount
                };
                
                setSurveys([...updatedSurveys]);
            } catch (error) {
                console.error(`Error fetching score for survey ${updatedSurveys[i].id}:`, error);
                updatedSurveys[i].isScoreLoading = false;
                setSurveys([...updatedSurveys]);
            }
        }
    };

    const getSurveys = async () => {
        try {
            setLoading(true);
            
            const { data, error } = await supabase
                .from('surveys')
                .select('id, created_at, title, description')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching surveys:', error);
                setLoading(false);
                return;
            }
            
            if (data) {
                const surveysWithLoadingScores = data.map(survey => ({
                    ...survey,
                    score: null,
                    isScoreLoading: true,
                    ratingQuestionsCount: 0,
                    binaryQuestionsCount: 0,
                    totalAnswersCount: 0
                }));
                
                setSurveys(surveysWithLoadingScores);
                setLoading(false);
                
                fetchSurveyScores(surveysWithLoadingScores);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error in getSurveys:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        getSurveys();
    }, []);

    if(loading) {
        return <LoadingBox />;
    }

    return (
        <Box sx={{ p: 4, pl: 16 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Surveys
            </Typography>
            <Grid container spacing={3}>
                {surveys.map((survey) => (
                    <Grid item xs={12} sm={6} md={4} key={survey.id}>
                        <SurveyCard
                            id={survey.id}
                            title={survey.title}
                            created_at={survey.created_at}
                            description={survey.description}
                            score={survey.score}
                            isScoreLoading={survey.isScoreLoading}
                            ratingQuestionsCount={survey.ratingQuestionsCount}
                            binaryQuestionsCount={survey.binaryQuestionsCount}
                            totalAnswersCount={survey.totalAnswersCount}
                            onClick={handleSurveyClick}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}