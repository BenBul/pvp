'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import StatisticsTemplate from '@/app/components/dashboard/statistics/Template';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { supabase } from '@/supabase/client';
import LoadingBox from '@/app/components/LoadingBox';

interface IQuestion {
    id: string;
    description: string;
    type: string;
}

interface IAnswer {
    question_id: string;
    created_at: string;
    ispositive?: boolean;
    rating?: number;
    input?: string;
}

export default function SurveyStatisticsPage() {
    const { survey } = useParams();
    const [questions, setQuestions] = useState<IQuestion[]>([]);
    const [answers, setAnswers] = useState<IAnswer[]>([]);
    const [loading, setLoading] = useState(true);

    const headers = [
        { key: 'question', label: 'Question' },
        { key: 'created_at', label: 'Date' },
        { key: 'ispositive', label: 'Positive' },
        { key: 'rating', label: 'Rating' },
        { key: 'input', label: 'Input' },
    ];

    const tableData = answers.map((answer) => {
        const question = questions.find((q) => q.id === answer.question_id)?.description || 'Unknown Question';
        return {
            question,
            created_at: new Date(answer.created_at).toLocaleString(),
            ispositive: answer.ispositive ? 'Yes' : 'No',
            rating: answer.rating || 'N/A',
            input: answer.input || 'N/A',
        };
    });

    const getQuestions = async () => {
        try {
            const { data, error } = await supabase
                .from('questions')
                .select('id, description, type')
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

    return (
        <StatisticsTemplate
            headers={headers}
            data={tableData}
            chart1={
                <div>
                    <h3>Custom Chart 1</h3>
                </div>
            }
            chart2={
                <div>
                    <h3>Custom Chart 2</h3>
                </div>
            }
            sidebar={
                <List>
                    {questions.map((question) => (
                        <ListItem key={question.id}>
                            <ListItemButton>
                                <ListItemText primary={question.description} secondary={question.type} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            }
        />
    );
}