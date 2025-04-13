'use client';
import { useRouter } from 'next/navigation';
import { Box, Typography, Grid } from '@mui/material';
import SurveyCard from '@/app/components/dashboard/statistics/SurveyCard';
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase/client';
import LoadingBox from '../components/LoadingBox';

export default function StatisticsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [surveys, setSurveys] = useState<{
        id: string;
        created_at: string;
        title: string;
        description?: string;
    }[]>([]);

    const handleSurveyClick = (id: number) => {
        router.push(`/statistics/${id}`);
    };

    const getSurveys = async () => {
        const { data, error } = await supabase
            .from('surveys')
            .select('id, created_at, title, description')
            .returns<{
                id: string;
                created_at: string;
                title: string;
                description?: string;
            }[]>();


        if (error) {
            console.error('Error fetching surveys:', error);
            return;
        }
        if (data) {
            setSurveys(data);
        }
    };

    useEffect(() => {
        setLoading(true);
        getSurveys();
        setLoading(false);
    }, []);

    if(loading) {
        return <LoadingBox />;
    }

    return (
        <Box sx={{ p: 4 }}>
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
                            onClick={handleSurveyClick}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}