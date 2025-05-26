import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  CircularProgress,
  Tooltip 
} from '@mui/material';

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
  npsScore?: number | null;
  isNpsLoading?: boolean;
  questionCount?: number;
}

interface SurveyItemsListProps {
  items: SurveyItem[];
  loading: boolean;
  onSurveyClick: (surveyId: string) => void;
}

const SurveyItemsList: React.FC<SurveyItemsListProps> = ({ 
  items, 
  loading, 
  onSurveyClick 
}) => {
  const getNpsScoreColor = (score: number) => {
    if (score <= -50) return '#d32f2f'; // Very Negative - Red
    if (score < 0) return '#ff5252';    // Negative - Light Red  
    if (score === 0) return '#757575';  // Neutral - Gray
    if (score < 50) return '#4caf50';   // Positive - Green
    return '#2e7d32';                   // Very Positive - Dark Green
  };

  const getNpsScoreLabel = (score: number) => {
    if (score <= -50) return 'Very Negative';
    if (score < 0) return 'Negative';
    if (score === 0) return 'Neutral';
    if (score < 50) return 'Positive';
    return 'Very Positive';
  };

  const renderNpsScore = (item: SurveyItem) => {
    if (item.isNpsLoading) {
      return (
        <Tooltip title="Calculating NPS Score...">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              Loading NPS...
            </Typography>
          </Box>
        </Tooltip>
      );
    }

    if (item.npsScore !== null && item.npsScore !== undefined) {
      return (
        <Tooltip title={`NPS Score: ${item.npsScore} (${getNpsScoreLabel(item.npsScore)})`}>
          <Chip
            label={`NPS: ${item.npsScore}`}
            size="small"
            sx={{
              bgcolor: getNpsScoreColor(item.npsScore),
              color: 'white',
              fontWeight: 'bold',
              minWidth: '80px'
            }}
          />
        </Tooltip>
      );
    }

    // Fallback to question count if NPS not available
    if (item.questionCount !== undefined) {
      return (
        <Chip
          label={`${item.questionCount} Questions`}
          size="small"
          variant="outlined"
          sx={{ minWidth: '100px' }}
        />
      );
    }

    return (
      <Typography variant="caption" color="text.secondary">
        No data
      </Typography>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No surveys found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((item) => (
        <Card 
          key={item.id}
          sx={{ 
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3
            }
          }}
          onClick={() => onSurveyClick(item.id)}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, mr: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {item.title}
                </Typography>
                
                {item.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.description.length > 150 
                      ? `${item.description.substring(0, 150)}...` 
                      : item.description
                    }
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Chip 
                    label={item.status || 'Active'} 
                    size="small" 
                    color={item.status === 'active' ? 'success' : 'default'}
                  />
                  
                  {item.positiveVotes !== undefined && item.negativeVotes !== undefined && (
                    <Typography variant="caption" color="text.secondary">
                      Votes: {item.positiveVotes}↑ {item.negativeVotes}↓
                    </Typography>
                  )}
                  
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(item.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                {renderNpsScore(item)}
                
                {item.hasWarning && (
                  <Chip 
                    label="⚠" 
                    size="small" 
                    color="warning"
                    sx={{ minWidth: 'auto', width: '32px' }}
                  />
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default SurveyItemsList;