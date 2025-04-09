"use client"

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Grid, 
  Paper, 
  Alert, 
  CircularProgress, 
  Select, 
  MenuItem, 
  IconButton,
  Switch,
  FormControlLabel,
  Input
} from '@mui/material';

import {
  Add as AddIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  QrCode as QrCodeIcon,
  Warning as AlertIcon,
  Image as LogoIcon
} from '@mui/icons-material';

export default function SurveyPage() {
  const { surveyId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [surveyTitle, setSurveyTitle] = useState("Loading...");
  const [showPositiveQr, setShowPositiveQr] = useState(false);
  const [showNegativeQr, setShowNegativeQr] = useState(false);
  const [positiveQrPreview, setPositiveQrPreview] = useState(null);
  const [negativeQrPreview, setNegativeQrPreview] = useState(null);
  const [qrViewDialog, setQrViewDialog] = useState({
    open: false,
    url: null,
    type: ""
  });
  
  const [newQuestionDesc, setNewQuestionDesc] = useState("");
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

  useEffect(() => {
    async function fetchSurveyData() {
      setIsLoading(true);
      try {
        const { data: surveyData, error: surveyError } = await supabase
          .from('surveys')
          .select('title')
          .eq('id', surveyId)
          .single();
        
        if (surveyError) throw surveyError;
        if (surveyData) setSurveyTitle(surveyData.title);
        
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select(`
            *,
            entries (*)
          `)
          .eq('survey_id', surveyId)
          .order('created_at', { ascending: false });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);
      } catch (error) {
        console.error("Error fetching survey data:", error);
        setError("Failed to load survey data");
      } finally {
        setIsLoading(false);
      }
    }

    if (surveyId) {
      fetchSurveyData();
    }
  }, [surveyId]);

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
    setShowPositiveQr(false);
    setShowNegativeQr(false);
    setError("");
  };

  const openModal = () => {
    setShowModal(true);
    document.body.style.overflow = 'hidden'; 
  };
  
  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto'; 
    resetFormValues(); 
  };

  const openQrDialog = (url, type) => {
    setQrViewDialog({
      open: true,
      url,
      type
    });
  };

  const closeQrDialog = () => {
    setQrViewDialog({
      open: false,
      url: null,
      type: ""
    });
  };

  const navigateToQrUrl = () => {
    if (qrViewDialog.url) {
      window.open(qrViewDialog.url, '_blank');
    }
    closeQrDialog();
  };

  const generateQrCode = async (redirectUrl, options) => {
    try {
      const payload = {
        URL: redirectUrl,
        color: options.color,
        body: options.body
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

  const generateQrPreview = async (options, type) => {
    try {
      const baseUrl = typeof window !== 'undefined' ? 
        `${window.location.protocol}//${window.location.host}` : '';
      const demoUrl = `${baseUrl}/demo/${type}/${crypto.randomUUID()}`;
      
      const qrImageUrl = await generateQrCode(demoUrl, options);
      
      if (type === 'positive') {
        setPositiveQrPreview(qrImageUrl);
        setShowPositiveQr(true);
        setShowNegativeQr(false);
      } else {
        setNegativeQrPreview(qrImageUrl);
        setShowNegativeQr(true);
        setShowPositiveQr(false);
      }
    } catch (error) {
      console.error("Error generating QR preview:", error);
      setError("Failed to generate QR preview");
    }
  };

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

      setQuestions([{
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
      }, ...questions]);
      
      closeModal(); 

    } catch (error) {
      console.error("Error creating question and QR codes:", error);
      setError("Failed to create question. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const QrCustomizationSection = ({ options, setOptions, type, previewUrl, onPreviewClick }) => (
    <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          {type === 'positive' ? 'Positive' : 'Negative'} Response QR
        </Typography>
        <Button
          onClick={onPreviewClick}
          variant="outlined"
          size="small"
          startIcon={<QrCodeIcon />}
          color={type === 'positive' ? 'success' : 'error'}
        >
          Preview QR
        </Button>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2" sx={{ mb: 1 }}>Main Color</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              component="input"
              type="color"
              value={options.color}
              onChange={(e) => setOptions({...options, color: e.target.value})}
              sx={{ width: 40, height: 36, border: '1px solid #ddd', borderRadius: 1, p: 0 }}
            />
            <TextField
              value={options.color}
              onChange={(e) => setOptions({...options, color: e.target.value})}
              size="small"
              fullWidth
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
            />
          </Box>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="body2" sx={{ mb: 1 }}>Body Shape</Typography>
          <Select
            value={options.body}
            onChange={(e) => setOptions({...options, body: e.target.value})}
            size="small"
            fullWidth
            sx={{ height: 36 }}
          >
            <MenuItem value="square">Square</MenuItem>
            <MenuItem value="dot">Dots</MenuItem>
            <MenuItem value="round">Rounded</MenuItem>
          </Select>
        </Grid>
  
        <Grid item xs={12}>
          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={options.enableLogo}
                  onChange={(e) => setOptions({...options, enableLogo: e.target.checked})}
                  color={type === 'positive' ? 'success' : 'error'}
                />
              }
              label="Add Logo to QR Code"
            />
          </Box>
        </Grid>
  
        {options.enableLogo && (
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mb: 1 }}>Logo URL</Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                border: '1px solid #ddd',
                borderRadius: 1,
                px: 1,
                py: 0.5
              }}
            >
              <LogoIcon color="action" fontSize="small" />
              <Input
                fullWidth
                disableUnderline
                placeholder="Enter logo URL"
                value={options.logo}
                onChange={(e) => setOptions({...options, logo: e.target.value})}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              For best results, use a square PNG image with transparent background
            </Typography>
          </Grid>
        )}
      </Grid>
      
      {previewUrl && (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid #eee', pt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            QR Code Preview
          </Typography>
          <Box 
            component="img" 
            src={previewUrl} 
            alt={`${type === 'positive' ? 'Positive' : 'Negative'} QR Preview`} 
            sx={{ width: 128, height: 128, objectFit: 'contain' }}
          />
        </Box>
      )}
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">{surveyTitle}</Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={openModal}
        >
          Add Question
        </Button>
      </Box>

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
        onClick={openModal}
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
      {questions.map((question, index) => {
        const positiveEntry = question.entries?.find(e => e.value === "positive");
        const negativeEntry = question.entries?.find(e => e.value === "negative");
        
        return (
          <React.Fragment key={question.id}>
            {index > 0 && <Divider sx={{ mx: 0 }} />}
            <Box 
              sx={{ 
                p: 4,
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
                borderBottom: index === questions.length - 1 ? 'none' : null
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
                      onClick={() => openQrDialog(positiveEntry.url, 'positive')}
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
                      onClick={() => openQrDialog(negativeEntry.url, 'negative')}
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
      })}
    </Box>
  )}
</CardContent>
      </Card>

      <Dialog 
        open={showModal} 
        onClose={closeModal}
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
          <IconButton onClick={closeModal} size="small">
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
              previewUrl={showPositiveQr ? positiveQrPreview : null}
              onPreviewClick={() => generateQrPreview(positiveOptions, 'positive')}
            />
            
            <QrCustomizationSection 
              options={negativeOptions} 
              setOptions={setNegativeOptions}
              type="negative"
              previewUrl={showNegativeQr ? negativeQrPreview : null}
              onPreviewClick={() => generateQrPreview(negativeOptions, 'negative')}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeModal}
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
      
      <Dialog 
        open={qrViewDialog.open} 
        onClose={closeQrDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box component="span">
              {qrViewDialog.type === 'positive' ? 'Positive' : 'Negative'} Response QR Code
            </Box>
            <IconButton onClick={closeQrDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
          {qrViewDialog.url ? (
            <Box 
              component="img" 
              src={qrViewDialog.url} 
              alt={`${qrViewDialog.type} QR Code`} 
              sx={{ width: 256, height: 256, objectFit: 'contain', mb: 2 }}
            />
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography color="text.secondary">Loading QR code...</Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeQrDialog}
            variant="outlined"
            color="inherit"
          >
            Close
          </Button>
          {qrViewDialog.url && (
            <Button
              onClick={navigateToQrUrl}
              variant="contained"
              color="primary"
            >
              View QR Image
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}