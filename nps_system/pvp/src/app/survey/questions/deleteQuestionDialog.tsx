import React, { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Typography, 
  Box,
  CircularProgress,
  IconButton,
  Alert
} from '@mui/material';
import { Close as CloseIcon, DeleteForever as DeleteIcon } from '@mui/icons-material';
import { supabase } from "@/supabase/client";

interface DeleteQuestionDialogProps {
  open: boolean;
  onClose: () => void;
  questionId: string | null;
  questionDescription: string;
  onQuestionDeleted: (questionId: string) => void;
}

const DeleteQuestionDialog: React.FC<DeleteQuestionDialogProps> = ({ 
  open, 
  onClose, 
  questionId, 
  questionDescription,
  onQuestionDeleted 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
      setError("");
    }
  };

  const handleDeleteQuestion = async () => {
    if (!questionId) return;
    
    setIsDeleting(true);
    setError("");

    try {
      const { error: entriesDeleteError } = await supabase
        .from('entries')
        .delete()
        .eq('question_id', questionId);

      if (entriesDeleteError) throw entriesDeleteError;
      
      const { error: questionDeleteError } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (questionDeleteError) throw questionDeleteError;
      
      onQuestionDeleted(questionId);
      handleClose();
    } catch (error) {
      console.error("Error deleting question:", error);
      setError("Failed to delete question. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="span">
            Delete Question
          </Typography>
          <IconButton onClick={handleClose} size="small" disabled={isDeleting}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete this question?
        </Typography>
        
        <Typography variant="body2" color="error" fontStyle="italic" sx={{ mt: 1 }}>
          "{questionDescription}"
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This action cannot be undone. All associated QR codes and response data will be permanently deleted.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDeleteQuestion}
          disabled={isDeleting}
          variant="contained"
          color="error"
          startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
        >
          {isDeleting ? 'Deleting...' : 'Delete Question'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteQuestionDialog;