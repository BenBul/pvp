'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StatisticsTemplate from '@/app/components/dashboard/statistics/Template';
import { supabase } from '@/supabase/client';
import LoadingBox from '@/app/components/LoadingBox';
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
import ResponsesTable from '@/app/components/dashboard/statistics/tables/ResponsesTable';
import QuestionsList from '@/app/components/dashboard/statistics/sidebar/QuestionsList';
import { IQuestion, IAnswer, TableData } from '../../types/survey';
import { processBinaryQuestionsData, processComprehensiveNPSData, createTableData } from '@/utils/surveyData';

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

export default function SurveyStatisticsPage() {
    const { survey } = useParams();
    const router = useRouter();
    
    const [questions, setQuestions] = useState<IQuestion[]>([]);
    const [answers, setAnswers] = useState<IAnswer[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [ratingFilter, setRatingFilter] = useState<string>('all');
    const [responseFilter, setResponseFilter] = useState<string>('all');
    const [questionFilter, setQuestionFilter] = useState<string>('');
    
    const headers: { key: keyof TableData; label: string }[] = [
        { key: 'question', label: 'Question' },
        { key: 'created_at', label: 'Date' },
        { key: 'ispositive', label: 'Positive' },
        { key: 'rating', label: 'Rating' },
        { key: 'input', label: 'Input' },
    ];
    
    const tableData = useMemo(() => createTableData(questions, answers), [questions, answers]);
    
    const filteredTableData = useMemo(() => {
        return tableData.filter(item => {
            if (ratingFilter !== 'all') {
                if (item.rating === 'N/A') return false;
                const rating = Number(item.rating);
                
                if (ratingFilter === '1-3' && (rating < 1 || rating > 3)) return false;
                if (ratingFilter === '4-7' && (rating < 4 || rating > 7)) return false;
                if (ratingFilter === '8-10' && (rating < 8 || rating > 10)) return false;
            }
            
            if (responseFilter !== 'all') {
                if (responseFilter === 'positive' && item.ispositive !== 'Yes') return false;
                if (responseFilter === 'negative' && item.ispositive !== 'No') return false;
            }
            
            if (questionFilter && !item.question.toLowerCase().includes(questionFilter.toLowerCase())) {
                return false;
            }
            
            return true;
        });
    }, [tableData, ratingFilter, responseFilter, questionFilter]);
    
    const handleOpenQuestionStatistics = (questionId: string) => {
        router.push(`/statistics/${survey}/${questionId}`);
    };
    
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
            
            setQuestions(data || []);
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
            
            const filteredAnswers = data?.filter((answer) => 
                questions.some((q) => q.id === answer.question_id)
            ) || [];
            
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
                    if (questions) {
                        await getAllAnswers(questions);
                    }
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
            customTable={
                <ResponsesTable
                    headers={headers}
                    data={filteredTableData}
                    ratingFilter={ratingFilter}
                    responseFilter={responseFilter}
                    questionFilter={questionFilter}
                    onRatingFilterChange={setRatingFilter}
                    onResponseFilterChange={setResponseFilter}
                    onQuestionFilterChange={setQuestionFilter}
                />
            }
        />
    );
}