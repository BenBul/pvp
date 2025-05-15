import React from 'react';
import { List, Typography, Paper } from '@mui/material';
import SurveyItem from './SurveyItem';

interface SurveyItem {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  user_id: string;
  category?: string;
  distance?: number;
  hasWarning?: boolean;
  createdAt?: string;
  positiveVotes?: number;
  negativeVotes?: number;
  questionCount?: number;
}

interface SurveyItemsListProps {
  items: SurveyItem[];
  loading: boolean;
  onSurveyClick: (surveyId: string) => void;
}

export default function SurveyItemsList({
  items,
  loading,
  onSurveyClick,
}: SurveyItemsListProps) {
  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (items.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">No surveys found</Typography>
      </Paper>
    );
  }

  return (
    <List sx={{ bgcolor: 'background' }}>
      {items.map((item) => (
        <SurveyItem key={item.id} item={item} onClick={onSurveyClick} />
      ))}
    </List>
  );
}