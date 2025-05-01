import React, { useState } from 'react';
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
  Warning as AlertIcon,
  SearchOff as NoResultsIcon
} from '@mui/icons-material';

import QuestionItem from './questionItem';
import DeleteQuestionDialog from './deleteQuestionDialog';

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

type QuestionsListProps = {
    questions: Question[];
    isLoading: boolean;
    onAddQuestion: () => void;
    onOpenQrDialog: (url: string, type: 'positive' | 'negative') => void;
    onQuestionDeleted: (questionId: string) => void;
};

const QuestionsList: React.FC<QuestionsListProps> = ({ 
  questions, 
  isLoading, 
  onAddQuestion, 
  onOpenQrDialog,
  onQuestionDeleted
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<{id: string, description: string} | null>(null);

  const handleOpenDeleteDialog = (questionId: string, description: string) => {
    setQuestionToDelete({ id: questionId, description });
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleQuestionDeleted = (questionId: string) => {
    onQuestionDeleted(questionId);
    setQuestionToDelete(null);
  };

  return (
    <>
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
              {questions.length === 0 ? (
                <>
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
                </>
              ) : (
                <>
                  <NoResultsIcon color="action" sx={{ fontSize: 40, mb: 2 }} />
                  <Typography color="text.secondary">No matching questions found</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Try adjusting your search criteria
                  </Typography>
                </>
              )}
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
                  onDeleteQuestion={handleOpenDeleteDialog}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {questionToDelete && (
        <DeleteQuestionDialog 
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          questionId={questionToDelete.id}
          questionDescription={questionToDelete.description}
          onQuestionDeleted={handleQuestionDeleted}
        />
      )}
    </>
  );
};

export default QuestionsList;