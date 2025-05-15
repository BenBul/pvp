// src/app/survey/questions/addQuestionModal.tsx
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
  short_code?: string | null;
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
  const [customShortCode, setCustomShortCode] = useState("");
  const [isCheckingCode, setIsCheckingCode] = useState(false);

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
    setCustomShortCode("");
    setPositiveOptions({ color: "#008000", body: "square", logo: "", enableLogo: false });
    setNegativeOptions({ color: "#ff0000", body: "square", logo: "", enableLogo: false });
    setRatingOptions({ color: "#000000", body: "square", logo: "", enableLogo: false });
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

    if (!response.ok) throw new Error(`QR code error: ${response.status}`);
    const data = await response.json();
    return data.url;
  };

  const generateQrPreview = useCallback(async (options: QrOptions, type: EntryValue) => {
    try {
      if (type === 'positive') setIsLoadingPositiveQr(true);
      if (type === 'negative') setIsLoadingNegativeQr(true);
      if (type === 'rating') setIsLoadingRatingQr(true);

      const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';
      const demoUrl = `${baseUrl}/demo/${type}/${crypto.randomUUID()}`;
      const qrImageUrl = await generateQrCode(demoUrl, options);

      if (type === 'positive') setPositiveQrPreview(qrImageUrl);
      if (type === 'negative') setNegativeQrPreview(qrImageUrl);
      if (type === 'rating') setRatingQrPreview(qrImageUrl);
    } catch {
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
      if (customShortCode) {
        setIsCheckingCode(true);
        const { data: existingCode } = await supabase
            .from('questions')
            .select('id')
            .eq('short_code', customShortCode)
            .maybeSingle();
        setIsCheckingCode(false);

        if (existingCode) {
          setError("Short code already exists. Please choose another.");
          setIsCreating(false);
          return;
        }
      }

      let entries: Entry[] = [];

      if (questionType === "binary") {
        const posId = crypto.randomUUID();
        const negId = crypto.randomUUID();
        const posUrl = `${baseUrl}/entry/${questionId}/${posId}`;
        const negUrl = `${baseUrl}/entry/${questionId}/${negId}`;
        const posQr = await generateQrCode(posUrl, positiveOptions);
        const negQr = await generateQrCode(negUrl, negativeOptions);

        entries = [
          { id: posId, url: posQr, question_id: questionId, value: 'positive' },
          { id: negId, url: negQr, question_id: questionId, value: 'negative' }
        ];
      } else {
        const ratingId = crypto.randomUUID();
        const ratingUrl = `${baseUrl}/entry/${questionId}/${ratingId}`;
        const ratingQr = await generateQrCode(ratingUrl, ratingOptions);

        entries = [
          { id: ratingId, url: ratingQr, question_id: questionId, value: 'rating' }
        ];
      }

      const { error: questionError } = await supabase
          .from('questions')
          .insert({
            id: questionId,
            description: newQuestionDesc,
            type: questionType,
            survey_id: surveyId,
            short_code: customShortCode || null
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
      console.error("Creation error:", error);
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

          <TextField
              label="Custom Short Code (optional)"
              value={customShortCode}
              onChange={(e) => setCustomShortCode(e.target.value.trim())}
              fullWidth
              margin="normal"
              disabled={isCheckingCode}
          />
          <Button
              variant="outlined"
              size="small"
              sx={{ mt: 1, mb: 2 }}
              onClick={() => setCustomShortCode(Math.random().toString(36).substring(2, 8))}
          >
            Generate
          </Button>

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
          <Button onClick={handleClose} variant="outlined" color="inherit" sx={{ borderRadius: 28}}>Cancel</Button>
          <Button
              onClick={handleCreateQuestion}
              disabled={isCreating || !newQuestionDesc.trim()}
              variant="contained"
              color="primary"
              startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
              sx={{ borderRadius: 28, ml: 1 }}
          >
            {isCreating ? 'Creating...' : 'Create Question'}
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default AddQuestionModal;
