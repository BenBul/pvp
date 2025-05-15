import React from 'react';
import { Box, Typography, Paper, Avatar, Chip } from '@mui/material';
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
    distance?: number;
    hasWarning?: boolean;
    positiveVotes?: number;
    negativeVotes?: number;
    questionCount?: number;
  };
  onClick: (surveyId: string) => void;
}

const SurveyItem: React.FC<SurveyItemProps> = ({ item, onClick }) => {
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
            {item.hasWarning && (
              <WarningIcon sx={{ ml: 1, color: 'orange', fontSize: 20 }} />
            )}
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
            {item.distance && (
              <Typography variant="caption" color="text.secondary">
                • {item.distance} miles away
              </Typography>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {item.description}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1" color='main' sx={{ mr: 1 }}>
            {item.questionCount} Questions
          </Typography>
      </Box>
    </Paper>
  );
};

export default SurveyItem;