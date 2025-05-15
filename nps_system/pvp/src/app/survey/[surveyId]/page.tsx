"use client"

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon 
} from '@mui/icons-material';

import QuestionsList from '../questions/questionsList';
import AddQuestionModal from '../questions/addQuestionModal';
import QrViewDialog from '../questions/qrViewDialog';

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

type QrType = "positive" | "negative" | "rating" | "text";

type QrDialogState = {
  open: boolean;
  url: string | null;
  type: QrType;
};

export default function SurveyPage() {
  const params = useParams();
  const rawSurveyId = params?.surveyId;
  const surveyId = Array.isArray(rawSurveyId) ? rawSurveyId[0] : rawSurveyId ?? "";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [surveyTitle, setSurveyTitle] = useState("Loading...");
  const [showAddModal, setShowAddModal] = useState(false);
  const [qrViewDialog, setQrViewDialog] = useState<QrDialogState>({
    open: false,
    url: null,
    type: "positive"
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
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);
        setFilteredQuestions(questionsData || []);
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

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredQuestions(questions);
    } else {
      const filtered = questions.filter(question => 
        question.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredQuestions(filtered);
    }
  }, [searchQuery, questions]);

  const handleAddQuestion = (newQuestion: Question) => {
    setQuestions(prevQuestions => {
      const updatedQuestions = [newQuestion, ...prevQuestions];
      setFilteredQuestions(updatedQuestions);
      return updatedQuestions;
    });
  };

  const handleQuestionDeleted = (questionId: string) => {
    setQuestions(prevQuestions => {
      const updatedQuestions = prevQuestions.filter(question => question.id !== questionId);
      setFilteredQuestions(updatedQuestions.filter(question => 
        question.description.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery.trim() === ''
      ));
      return updatedQuestions;
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const openAddModal = () => {
    setShowAddModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    document.body.style.overflow = 'auto';
  };

  const openQrDialog = (url: string, type: QrType) => {
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
      type: "positive"
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">{surveyTitle}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={openAddModal}
          >
            Add Question
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search questions by description..."
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { 
              borderRadius: 2,
              bgcolor: '#f5f5f5',
              '&:hover': {
                bgcolor: '#f0f0f0'
              }
            }
          }}
        />
      </Box>

      <QuestionsList
        questions={filteredQuestions}
        isLoading={isLoading}
        onAddQuestion={openAddModal}
        onOpenQrDialog={openQrDialog}
        onQuestionDeleted={handleQuestionDeleted}
      />

      <AddQuestionModal
        open={showAddModal}
        onClose={closeAddModal}
        surveyId={surveyId}
        onQuestionAdded={handleAddQuestion}
      />

      <QrViewDialog
        open={qrViewDialog.open}
        url={qrViewDialog.url}
        type={qrViewDialog.type}
        onClose={closeQrDialog}
      />
    </Container>
  );
}