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
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

import BinaryQuestionsChart from '@/app/components/dashboard/statistics/charts/BinaryQuestionsChart';
import NPSScoreChart from '@/app/components/dashboard/statistics/charts/NPSScoreChart';
import QuestionsList from '@/app/components/dashboard/statistics/sidebar/QuestionsList';
import ResponsesTable from '@/app/components/dashboard/statistics/tables/ResponsesTable';

import { processBinaryQuestionsData, processComprehensiveNPSData, createTableData } from '@/utils/surveyData';
import { applyFilters } from '@/utils/filterUtils';
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
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
            const { data, error } = await supabase
                .from('questions')
                .select('id, description, type, isDeleted:is_deleted')
                .eq('survey_id', survey)
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

    // Process data for charts
    const binaryData = processBinaryQuestionsData(questions, answers);
    const npsData = processComprehensiveNPSData(questions, answers);

    // Use our ResponsesTable component instead of custom table
    const responsesTable = (
        <ResponsesTable
            headers={headers}
            data={filteredTableData}
            ratingFilter={ratingFilter}
            responseFilter={responseFilter}
            questionFilter={questionFilter}
            ratingRangeFilter={ratingRangeFilter}
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
            chart1={
                <BinaryQuestionsChart binaryData={binaryData} />
            }
            chart2={
                <NPSScoreChart npsData={npsData} />
            }
            sidebar={
                <QuestionsList 
                    questions={questions} 
                    onQuestionClick={handleOpenQuestionStatistics} 
                />
            }
            customTable={responsesTable}
        />
    );
}