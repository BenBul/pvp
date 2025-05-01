import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/supabase/client";
import { 
  Box, 
  Button, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Alert, 
  CircularProgress 
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import QrCustomizationSection from './qrCustomizationSection';

interface AddQuestionModalProps {
  open: boolean;
  onClose: () => void;
  surveyId: string;
  onQuestionAdded: (question: any) => void;
}

interface QrOptions {
  color: string;
  body: string;
  logo: string;
  enableLogo: boolean;
}

const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ open, onClose, surveyId, onQuestionAdded }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [newQuestionDesc, setNewQuestionDesc] = useState("");
  
  const [positiveQrPreview, setPositiveQrPreview] = useState<string | null>(null);
  const [negativeQrPreview, setNegativeQrPreview] = useState<string | null>(null);
  const [isLoadingPositiveQr, setIsLoadingPositiveQr] = useState(false);
  const [isLoadingNegativeQr, setIsLoadingNegativeQr] = useState(false);
  
  const [positiveOptions, setPositiveOptions] = useState({
    color: "#008000",
    body: "square",
    logo: "",
    enableLogo: false
  });
  
  const [negativeOptions, setNegativeOptions] = useState({
    color: "#ff0000",
    body: "square",
    logo: "",
    enableLogo: false
  });

  const debouncedPositiveOptions = useDebounce(positiveOptions, 500);
  const debouncedNegativeOptions = useDebounce(negativeOptions, 500);

  const resetFormValues = () => {
    setNewQuestionDesc("");
    setPositiveOptions({
      color: "#008000",
      body: "square",
      logo: "",
      enableLogo: false
    });
    
    setNegativeOptions({
      color: "#ff0000",
      body: "square",
      logo: "",
      enableLogo: false
    });
    
    setPositiveQrPreview(null);
    setNegativeQrPreview(null);
    setError("");
  };

  const handleClose = () => {
    onClose();
    resetFormValues();
  };

  const generateQrCode = async (redirectUrl: string, options: QrOptions) => {
    try {
      const payload = {
        URL: redirectUrl,
        color: options.color,
        body: options.body,
        logo: "",
      };

      if (options.enableLogo && options.logo) {
        payload.logo = options.logo;
      }

      const response = await fetch("/api/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw error;
    }
  };

  const generateQrPreview = useCallback(async (options: QrOptions, type: 'positive'|'negative') => {
    try {
      if (type === 'positive') {
        setIsLoadingPositiveQr(true);
      } else {
        setIsLoadingNegativeQr(true);
      }

      const baseUrl = typeof window !== 'undefined' ? 
        `${window.location.protocol}//${window.location.host}` : '';
      const demoUrl = `${baseUrl}/demo/${type}/${crypto.randomUUID()}`;
      
      const qrImageUrl = await generateQrCode(demoUrl, options);
      
      if (type === 'positive') {
        setPositiveQrPreview(qrImageUrl);
      } else {
        setNegativeQrPreview(qrImageUrl);
      }
    } catch (error) {
      console.error("Error generating QR preview:", error);
      setError("Failed to generate QR preview");
    } finally {
      if (type === 'positive') {
        setIsLoadingPositiveQr(false);
      } else {
        setIsLoadingNegativeQr(false);
      }
    }
  }, []);

  useEffect(() => {
    if (open) {
      generateQrPreview(debouncedPositiveOptions, 'positive');
    }
  }, [debouncedPositiveOptions, open, generateQrPreview]);

  useEffect(() => {
    if (open) {
      generateQrPreview(debouncedNegativeOptions, 'negative');
    }
  }, [debouncedNegativeOptions, open, generateQrPreview]);

  const handleCreateBoolQuestion = async () => {
    if (!newQuestionDesc.trim()) {
      setError("Please enter a question description");
      return;
    }

    setIsCreating(true);
    setError("");

    const questionId = crypto.randomUUID();
    const positiveEntryId = crypto.randomUUID();
    const negativeEntryId = crypto.randomUUID();
    
    const baseUrl = typeof window !== 'undefined' ? 
      `${window.location.protocol}//${window.location.host}` : '';

    try {
      const positiveRedirectUrl = `${baseUrl}/entry/${questionId}/${positiveEntryId}`;
      const negativeRedirectUrl = `${baseUrl}/entry/${questionId}/${negativeEntryId}`;
      
      const positiveQrUrl = await generateQrCode(positiveRedirectUrl, positiveOptions);
      const negativeQrUrl = await generateQrCode(negativeRedirectUrl, negativeOptions);

      const { error: questionError } = await supabase
        .from('questions')
        .insert({
          id: questionId,
          description: newQuestionDesc,
          type: "binary",
          survey_id: surveyId,
        });

      if (questionError) throw questionError;

      const { error: entriesError } = await supabase
        .from('entries')
        .insert([
          {
            id: positiveEntryId,
            url: positiveQrUrl,
            question_id: questionId,
            value: "positive"
          },
          {
            id: negativeEntryId,
            url: negativeQrUrl,
            question_id: questionId,
            value: "negative"
          }
        ]);

      if (entriesError) throw entriesError;

      const newQuestion = {
        id: questionId,
        description: newQuestionDesc,
        type: "binary",
        survey_id: surveyId,
        created_at: new Date().toISOString(),
        entries: [
          {
            id: positiveEntryId,
            url: positiveQrUrl,
            question_id: questionId,
            value: "positive"
          },
          {
            id: negativeEntryId,
            url: negativeQrUrl,
            question_id: questionId,
            value: "negative"
          }
        ]
      };
      
      onQuestionAdded(newQuestion);
      handleClose();

    } catch (error) {
      console.error("Error creating question and QR codes:", error);
      setError("Failed to create question. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box component="span">Add New Question</Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          label="Question Description"
          value={newQuestionDesc}
          onChange={(e) => setNewQuestionDesc(e.target.value)}
          placeholder="Enter question description"
          fullWidth
          margin="normal"
          variant="outlined"
        />
        
        <Box sx={{ mt: 3 }}>
          <QrCustomizationSection 
            options={positiveOptions} 
            setOptions={setPositiveOptions}
            type="positive"
            previewUrl={positiveQrPreview}
            isLoading={isLoadingPositiveQr}
          />
          
          <QrCustomizationSection 
            options={negativeOptions} 
            setOptions={setNegativeOptions}
            type="negative"
            previewUrl={negativeQrPreview}
            isLoading={isLoadingNegativeQr}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreateBoolQuestion}
          disabled={isCreating || !newQuestionDesc.trim()}
          variant="contained"
          color="primary"
          startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
        >
          {isCreating ? 'Creating...' : 'Create Question'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddQuestionModal;