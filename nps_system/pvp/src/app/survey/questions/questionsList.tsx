import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  CircularProgress 
} from '@mui/material';
import { 
  Add as AddIcon,
  Warning as AlertIcon 
} from '@mui/icons-material';

import QuestionItem from './questionItem';

const QuestionsList = ({ questions, isLoading, onAddQuestion, onOpenQrDialog }) => {
  return (
    <Card elevation={2} sx={{ overflow: 'hidden', borderRadius: 2 }}>
      <CardHeader 
        title="Survey Questions"
        sx={{ bgcolor: 'grey.50', borderBottom: '1px solid #eee' }}
      />
      
      <CardContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography color="text.secondary">Loading questions...</Typography>
          </Box>
        ) : questions.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <AlertIcon color="action" sx={{ fontSize: 40, mb: 2 }} />
            <Typography color="text.secondary">No questions created yet</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onAddQuestion}
              sx={{ mt: 2 }}
            >
              Add Your First Question
            </Button>
          </Box>
        ) : (
          <Box 
            sx={{ 
              maxHeight: '500px', 
              overflowY: 'auto', 
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#bbbbbb',
                borderRadius: '4px',
                '&:hover': {
                  background: '#999999',
                },
              },
            }}
          >
            {questions.map((question, index) => (
              <QuestionItem 
                key={question.id}
                question={question}
                isLast={index === questions.length - 1}
                showDivider={index > 0}
                onOpenQrDialog={onOpenQrDialog}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionsList;