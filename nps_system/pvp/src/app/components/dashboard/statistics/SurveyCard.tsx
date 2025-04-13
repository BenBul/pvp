import React from 'react';
import { Card, CardActionArea, CardContent, Typography } from '@mui/material';

interface SurveyCardProps {
    id: string;
    created_at: string;
    title: string;
    description?: string; 
    onClick: (id: number) => void;
}

const SurveyCard: React.FC<SurveyCardProps> = ({ id, title, description, onClick }) => {
    return (
        <Card sx={{ height: 200 }}> 
            <CardActionArea onClick={() => onClick(id)} sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', height: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {title}
                    </Typography>
                    {description && (
                        <Typography variant="body2" color="text.secondary">
                            {description}
                        </Typography>
                    )}
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default SurveyCard;