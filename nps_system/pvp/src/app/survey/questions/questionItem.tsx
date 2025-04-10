import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Divider 
} from '@mui/material';
import { QrCode as QrCodeIcon } from '@mui/icons-material';

const QuestionItem = ({ question, isLast, showDivider, onOpenQrDialog }) => {
  const positiveEntry = question.entries?.find(e => e.value === "positive");
  const negativeEntry = question.entries?.find(e => e.value === "negative");
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <React.Fragment>
      {showDivider && <Divider sx={{ mx: 0 }} />}
      <Box 
        sx={{ 
          p: 4,
          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
          borderBottom: isLast ? 'none' : null
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              {question.description}
            </Typography>
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
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  );
};

export default QuestionItem;