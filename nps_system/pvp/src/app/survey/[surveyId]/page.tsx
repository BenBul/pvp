"use client"

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import {
  Box,
  Button,
  Container,
  Typography
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

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

type QrType = "positive" | "negative";

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

  const handleAddQuestion = (newQuestion: Question) => {
    setQuestions([newQuestion, ...questions]);
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
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={openAddModal}
        >
          Add Question
        </Button>
      </Box>

      <QuestionsList
        questions={questions}
        isLoading={isLoading}
        onAddQuestion={openAddModal}
        onOpenQrDialog={openQrDialog}
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