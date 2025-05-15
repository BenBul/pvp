import React from 'react';
import {
  Box,
  Button,
  Typography,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

type Entry = {
  id: string;
  created_at: string;
  question_id: string;
  value: string;
  url: string;
};

type Question = {
  id: string;
  created_at: string;
  survey_id: string;
  description: string;
  type: string;
  entries: Entry[];
};

type QuestionItemProps = {
  question: Question;
  isLast: boolean;
  showDivider: boolean;
  onOpenQrDialog: (url: string, type: 'positive' | 'negative' | 'rating' | 'text') => void;
  onDeleteQuestion: (questionId: string, description: string) => void;
};

const QuestionItem: React.FC<QuestionItemProps> = ({
                                                     question,
                                                     isLast,
                                                     showDivider,
                                                     onOpenQrDialog,
                                                     onDeleteQuestion
                                                   }) => {
  const positiveEntry = question.entries?.find(e => e.value === "positive");
  const negativeEntry = question.entries?.find(e => e.value === "negative");
  const ratingEntry = question.entries?.find(e => e.value === "rating");
  const textEntry = question.entries?.find(e => e.value === "text");

  const formatDate = (dateString: string) => {
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
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  {question.description}
                </Typography>
                <Tooltip title="Delete question">
                  <IconButton
                      size="small"
                      color="error"
                      sx={{ ml: 1 }}
                      onClick={() => onDeleteQuestion(question.id, question.description)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
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

              {ratingEntry && (
                  <Button
                      onClick={() => onOpenQrDialog(ratingEntry.url, 'rating')}
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<QrCodeIcon />}
                  >
                    Rating QR
                  </Button>
              )}

                {textEntry && (
                    <Button
                        onClick={() => onOpenQrDialog(textEntry.url, 'text')}
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<QrCodeIcon />}
                    >
                        Text QR
                    </Button>
                )}
            </Box>
          </Box>
        </Box>
      </React.Fragment>
  );
};

export default QuestionItem;
