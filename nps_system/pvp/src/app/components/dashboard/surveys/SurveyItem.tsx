import React from 'react';
import { Box, Typography, Paper, Avatar, Chip, CircularProgress, Tooltip } from '@mui/material';
import { 
  BarChart as BarChartIcon, 
  Warning as WarningIcon, 
  KeyboardArrowUp as KeyboardArrowUpIcon, 
  KeyboardArrowDown as KeyboardArrowDownIcon 
} from '@mui/icons-material';

interface SurveyItemProps {
  item: {
    id: string;
    title: string;
    description: string;
    status: string;
    category?: string;
    positiveVotes?: number;
    negativeVotes?: number;
    questionCount?: number;
    npsScore?: number | null;
    isNpsLoading?: boolean;
  };
  onClick: (surveyId: string) => void;
}

const SurveyItem: React.FC<SurveyItemProps> = ({ item, onClick }) => {
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

  const renderNpsScore = () => {
    if (item.isNpsLoading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Loading NPS...
          </Typography>
        </Box>
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
        <Typography variant="body1" color='main' sx={{ mr: 1 }}>
          {item.questionCount} Questions
        </Typography>
      );
    }

    return (
      <Typography variant="body2" color="text.secondary">
        No data
      </Typography>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 1,
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid rgb(218, 218, 218)',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      }}
      onClick={() => onClick(item.id)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: '#eee', color: '#666', mr: 2 }}>
          <BarChartIcon />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            {item.title}
            <Chip
              label={item.status}
              size="small"
              sx={{
                ml: 1,
                bgcolor: item.status === 'active' ? '#a0e57c' : '#f0f0f0',
                color: item.status === 'active' ? '#326015' : '#666',
              }}
            />
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {item.category && (
              <Typography variant="caption" color="text.secondary">
                Category: {item.category}
              </Typography>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {item.description}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {renderNpsScore()}
      </Box>
    </Paper>
  );
};

export default SurveyItem;