'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import StatisticsTemplate from '@/app/components/dashboard/statistics/Template';
import { supabase } from '@/supabase/client';
import LoadingBox from '@/app/components/LoadingBox';
import { useRouter } from "next/navigation";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    Filler
} from 'chart.js';

import BinaryQuestionsChart from '@/app/components/dashboard/statistics/charts/BinaryQuestionsChart';
import NPSScoreChart from '@/app/components/dashboard/statistics/charts/NPSScoreChart';
import QuestionsList from '@/app/components/dashboard/statistics/sidebar/QuestionsList';
import ResponsesTable from '@/app/components/dashboard/statistics/tables/ResponsesTable';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { processBinaryQuestionsData, processComprehensiveNPSData, createTableData } from '@/utils/surveyData';
import { applyFilters } from '@/utils/filterUtils';
import { exportSurveyToCsv } from '@/utils/exportUtils';
import { Button, CircularProgress } from '@mui/material';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    ChartTooltip,
    Legend,
    Filler
);

interface IQuestion {
    id: string;
    description: string;
    type: string;
    isDeleted: boolean;
}

interface IAnswer {
    question_id: string;
    created_at: string;
    ispositive?: boolean;
    rating?: number;
    input?: string;
}

interface TableData {
    question: string;
    created_at: string;
    ispositive: string;
    rating: number | string;
    input: string;
    question_id: string;
}

export default function SurveyStatisticsPage() {
    const { survey } = useParams();
    const [questions, setQuestions] = useState<IQuestion[]>([]);
    const [answers, setAnswers] = useState<IAnswer[]>([]);
    const [loading, setLoading] = useState(true);
    const [surveyTitle, setSurveyTitle] = useState('Survey Analysis');
    const [exporting, setExporting] = useState(false);
    const router = useRouter();

    // Filter states
    const [ratingRangeFilter, setRatingRangeFilter] = useState<[number, number] | null>(null);
    const [ratingFilter, setRatingFilter] = useState<string>('all'); // Keep for compatibility
    const [responseFilter, setResponseFilter] = useState<string>('all');
    const [questionFilter, setQuestionFilter] = useState<string>('');

    const headers: { key: keyof TableData; label: string }[] = [
        { key: 'question', label: 'Question' },
        { key: 'created_at', label: 'Date' },
        { key: 'ispositive', label: 'Positive' },
        { key: 'rating', label: 'Rating' },
        { key: 'input', label: 'Input' },
    ];

    const handleExportSurvey = async () => {
        if (!survey) return;
        
        setExporting(true);
        try {
            await exportSurveyToCsv(survey as string, surveyTitle);
        } catch (error) {
            console.error('Error exporting survey:', error);
        } finally {
            setExporting(false);
        }
    };

    const handleOpenQuestionStatistics = (questionId: string) => {
        router.push(`/statistics/${survey}/${questionId}`);
    };

    const tableData = createTableData(questions, answers);

    // Apply filters to the table data using our utility function
    const filteredTableData = useMemo(() => 
        applyFilters(tableData, ratingRangeFilter, responseFilter, questionFilter),
    [tableData, ratingRangeFilter, responseFilter, questionFilter]);

    const getQuestions = async () => {
        try {
            const { data: surveyData, error: surveyError } = await supabase
                .from('surveys')
                .select('title')
                .eq('id', survey)
                .single();
                
            if (surveyData?.title) {
                setSurveyTitle(surveyData.title);
            }
            
            const { data, error } = await supabase
                .from('questions')
                .select('id, description, type, isDeleted:is_deleted, created_at')
                .eq('survey_id', survey)
                .order('is_deleted', { ascending: true })
                .order('description', { ascending: true })
                .returns<IQuestion[]>();
            if (error) {
                console.error('Error fetching questions:', error);
                return;
            }

            setQuestions(data);
            return data;
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    const getAllAnswers = async (questions: IQuestion[]) => {
        try {
            const { data, error } = await supabase
                .from('answers')
                .select('question_id, created_at, ispositive, rating, input')
                .returns<IAnswer[]>();
            if (error) {
                console.error('Error fetching answers:', error);
                return;
            }

            const filteredAnswers = data.filter((answer) => questions.some((q) => q.id === answer.question_id));

            setAnswers(filteredAnswers);
        } catch (error) {
            console.error('Error fetching answers:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (survey) {
                setLoading(true);
                try {
                    const questions = await getQuestions();
                    if (!questions) return;
                    await getAllAnswers(questions);
                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [survey]);

    if (loading) {
        return <LoadingBox />;
    }

    const binaryData = processBinaryQuestionsData(questions, answers);
    const npsData = processComprehensiveNPSData(questions, answers);

    const responsesTable = (
        <ResponsesTable
            headers={headers}
            data={filteredTableData}
            ratingFilter={ratingFilter}
            responseFilter={responseFilter}
            questionFilter={questionFilter}
            ratingRangeFilter={ratingRangeFilter}
            surveyTitle={surveyTitle}
            onRatingFilterChange={setRatingFilter}
            onResponseFilterChange={setResponseFilter}
            onQuestionFilterChange={setQuestionFilter}
            onRatingRangeFilterChange={setRatingRangeFilter}
        />
    );

    return (
        <StatisticsTemplate
            headers={headers}
            data={filteredTableData}
            title={surveyTitle} 
            chart1={
                <BinaryQuestionsChart binaryData={binaryData} />
            }
            chart2={
                <NPSScoreChart npsData={npsData} surveyTitle={surveyTitle}/>
            }
            sidebar={
                <QuestionsList 
                    questions={questions} 
                    onQuestionClick={handleOpenQuestionStatistics} 
                />
            }
            customTable={responsesTable}
            actions={
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportSurvey}
                    disabled={exporting}
                    sx={{ borderRadius: 28 }}
                >
                    {exporting ? (
                        <>
                            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                            Exporting...
                        </>
                    ) : (
                        'Export Survey'
                    )}
                </Button>
            }
        />
    );
}
