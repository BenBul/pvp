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
  CircularProgress,
  MenuItem,
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

type EntryValue = 'positive' | 'negative' | 'rating';

interface Entry {
  id: string;
  url: string;
  question_id: string;
  value: EntryValue;
}

const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ open, onClose, surveyId, onQuestionAdded }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [newQuestionDesc, setNewQuestionDesc] = useState("");
  const [questionType, setQuestionType] = useState<"binary" | "rating">("binary");

  const [positiveOptions, setPositiveOptions] = useState<QrOptions>({
    color: "#008000",
    body: "square",
    logo: "",
    enableLogo: false
  });

  const [negativeOptions, setNegativeOptions] = useState<QrOptions>({
    color: "#ff0000",
    body: "square",
    logo: "",
    enableLogo: false
  });

  const [ratingOptions, setRatingOptions] = useState<QrOptions>({
    color: "#000000",
    body: "square",
    logo: "",
    enableLogo: false
  });

  const [positiveQrPreview, setPositiveQrPreview] = useState<string | null>(null);
  const [negativeQrPreview, setNegativeQrPreview] = useState<string | null>(null);
  const [ratingQrPreview, setRatingQrPreview] = useState<string | null>(null);

  const [isLoadingPositiveQr, setIsLoadingPositiveQr] = useState(false);
  const [isLoadingNegativeQr, setIsLoadingNegativeQr] = useState(false);
  const [isLoadingRatingQr, setIsLoadingRatingQr] = useState(false);

  const debouncedPositiveOptions = useDebounce(positiveOptions, 500);
  const debouncedNegativeOptions = useDebounce(negativeOptions, 500);
  const debouncedRatingOptions = useDebounce(ratingOptions, 500);

  const resetFormValues = () => {
    setNewQuestionDesc("");
    setQuestionType("binary");
    setPositiveOptions({
      color: "#008000", body: "square", logo: "", enableLogo: false
    });
    setNegativeOptions({
      color: "#ff0000", body: "square", logo: "", enableLogo: false
    });
    setRatingOptions({
      color: "#000000", body: "square", logo: "", enableLogo: false
    });
    setPositiveQrPreview(null);
    setNegativeQrPreview(null);
    setRatingQrPreview(null);
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
        logo: options.enableLogo ? options.logo : "",
      };

      const response = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("QR code generation failed:", error);
      throw error;
    }
  };

  const generateQrPreview = useCallback(async (options: QrOptions, type: 'positive' | 'negative' | 'rating') => {
    try {
      if (type === 'positive') setIsLoadingPositiveQr(true);
      if (type === 'negative') setIsLoadingNegativeQr(true);
      if (type === 'rating') setIsLoadingRatingQr(true);

      const baseUrl = typeof window !== 'undefined'
          ? `${window.location.protocol}//${window.location.host}`
          : '';
      const demoUrl = `${baseUrl}/demo/${type}/${crypto.randomUUID()}`;
      const qrImageUrl = await generateQrCode(demoUrl, options);

      if (type === 'positive') setPositiveQrPreview(qrImageUrl);
      if (type === 'negative') setNegativeQrPreview(qrImageUrl);
      if (type === 'rating') setRatingQrPreview(qrImageUrl);
    } catch (error) {
      setError("Failed to generate QR preview");
    } finally {
      if (type === 'positive') setIsLoadingPositiveQr(false);
      if (type === 'negative') setIsLoadingNegativeQr(false);
      if (type === 'rating') setIsLoadingRatingQr(false);
    }
  }, []);

  useEffect(() => {
    if (open && questionType === "binary") {
      generateQrPreview(debouncedPositiveOptions, 'positive');
      generateQrPreview(debouncedNegativeOptions, 'negative');
    }
  }, [debouncedPositiveOptions, debouncedNegativeOptions, open, questionType, generateQrPreview]);

  useEffect(() => {
    if (open && questionType === "rating") {
      generateQrPreview(debouncedRatingOptions, 'rating');
    }
  }, [debouncedRatingOptions, open, questionType, generateQrPreview]);

  const handleCreateQuestion = async () => {
    if (!newQuestionDesc.trim()) {
      setError("Please enter a question description");
      return;
    }

    setIsCreating(true);
    setError("");

    const questionId = crypto.randomUUID();
    const baseUrl = typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.host}`
        : '';

    try {
      let entries: Entry[] = [];

      if (questionType === "binary") {
        const positiveId = crypto.randomUUID();
        const negativeId = crypto.randomUUID();

        const positiveUrl = `${baseUrl}/entry/${questionId}/${positiveId}`;
        const negativeUrl = `${baseUrl}/entry/${questionId}/${negativeId}`;

        const positiveQrUrl = await generateQrCode(positiveUrl, positiveOptions);
        const negativeQrUrl = await generateQrCode(negativeUrl, negativeOptions);

        entries = [
          { id: positiveId, url: positiveQrUrl, question_id: questionId, value: 'positive' },
          { id: negativeId, url: negativeQrUrl, question_id: questionId, value: 'negative' }
        ];
      } else if (questionType === "rating") {
        const ratingEntryId = crypto.randomUUID();
        const ratingUrl = `${baseUrl}/entry/${questionId}/${ratingEntryId}`;
        const ratingQrUrl = await generateQrCode(ratingUrl, ratingOptions);

        entries = [
          { id: ratingEntryId, url: ratingQrUrl, question_id: questionId, value: 'rating' }
        ];
      }

      const { error: questionError } = await supabase
          .from('questions')
          .insert({
            id: questionId,
            description: newQuestionDesc,
            type: questionType,
            survey_id: surveyId,
          });

      if (questionError) throw questionError;

      const { error: entriesError } = await supabase
          .from('entries')
          .insert(entries);

      if (entriesError) throw entriesError;

      onQuestionAdded({
        id: questionId,
        description: newQuestionDesc,
        type: questionType,
        survey_id: surveyId,
        created_at: new Date().toISOString(),
        entries
      });

      handleClose();
    } catch (error) {
      console.error("Error creating question and QR codes:", error);
      setError("Failed to create question. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md"
              sx={{ '& .MuiDialog-paper': { borderRadius: 2, maxHeight: '80vh' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box component="span">Add New Question</Box>
          <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
              label="Question Description"
              value={newQuestionDesc}
              onChange={(e) => setNewQuestionDesc(e.target.value)}
              placeholder="Enter question description"
              fullWidth
              margin="normal"
          />

          <TextField
              label="Question Type"
              select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as "binary" | "rating")}
              fullWidth
              margin="normal"
          >
            <MenuItem value="binary">Binary (Yes / No)</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
          </TextField>

          <Box sx={{ mt: 3 }}>
            {questionType === "binary" ? (
                <>
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
                </>
            ) : (
                <QrCustomizationSection
                    options={ratingOptions}
                    setOptions={setRatingOptions}
                    type="rating"
                    previewUrl={ratingQrPreview}
                    isLoading={isLoadingRatingQr}
                />
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit">Cancel</Button>
          <Button
              onClick={handleCreateQuestion}
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