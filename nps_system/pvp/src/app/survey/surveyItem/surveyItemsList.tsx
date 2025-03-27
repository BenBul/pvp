import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  Avatar, 
  Chip 
} from '@mui/material';
import { 
  BarChart as BarChartIcon, 
  Warning as WarningIcon, 
  KeyboardArrowUp as KeyboardArrowUpIcon, 
  KeyboardArrowDown as KeyboardArrowDownIcon 
} from '@mui/icons-material';

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
}

interface SurveyItemsListProps {
  items: SurveyItem[];
  loading: boolean;
  onSurveyClick: (surveyId: string) => void;
}

export default function SurveyItemsList({ 
  items, 
  loading, 
  onSurveyClick 
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
    <List sx={{ bgcolor: 'background.paper' }}>
      {items.map((item) => (
        <Paper 
          key={item.id} 
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
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
          onClick={() => onSurveyClick(item.id)}
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
                    color: item.status === 'active' ? '#326015' : '#666'
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
          <Box 
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>{item.positiveVotes}</Typography>
              <KeyboardArrowUpIcon sx={{ color: 'text.secondary' }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>{item.negativeVotes}</Typography>
              <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
            </Box>
          </Box>
        </Paper>
      ))}
    </List>
  );
}