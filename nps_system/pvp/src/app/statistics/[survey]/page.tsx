'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import StatisticsTemplate from '@/app/components/dashboard/statistics/Template';
import { List, ListItem, ListItemButton, ListItemText, Box } from '@mui/material';
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
import { Pie, Bar } from 'react-chartjs-2';

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
    const router = useRouter();

    const headers = [
        { key: 'question', label: 'Question' },
        { key: 'created_at', label: 'Date' },
        { key: 'ispositive', label: 'Positive' },
        { key: 'rating', label: 'Rating' },
        { key: 'input', label: 'Input' },
    ];

    const handleOpenQuestionStatistics = (question: string) => {
        router.push(`/statistics/${survey}/${question}`);
    }

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

    const processBinaryQuestionsData = () => {
        const binaryQuestions = questions.filter(q => q.type === 'binary');
        
        const binaryData = binaryQuestions.map(question => {
            const questionAnswers = answers.filter(answer => answer.question_id === question.id);
            const positiveCount = questionAnswers.filter(a => a.ispositive).length;
            const negativeCount = questionAnswers.filter(a => a.ispositive === false).length;
            
            return {
                question: question.description.length > 20 
                    ? question.description.substring(0, 20) + '...' 
                    : question.description,
                positiveCount,
                negativeCount,
                totalCount: questionAnswers.length
            };
        });

        return binaryData;
    };

    const processRatingQuestionsData = () => {
        const ratingQuestions = questions.filter(q => q.type === 'rating');
        
        const ratingData = ratingQuestions.map(question => {
            const questionAnswers = answers.filter(answer => 
                answer.question_id === question.id && answer.rating !== null && answer.rating !== undefined
            );
            
            const totalRating = questionAnswers.reduce((sum, answer) => sum + (answer.rating || 0), 0);
            const avgRating = questionAnswers.length > 0 ? totalRating / questionAnswers.length : 0;
            
            return {
                question: question.description.length > 20 
                    ? question.description.substring(0, 20) + '...' 
                    : question.description,
                averageRating: parseFloat(avgRating.toFixed(1)),
                responseCount: questionAnswers.length
            };
        });

        return ratingData;
    };

    const binaryData = processBinaryQuestionsData();
    const ratingData = processRatingQuestionsData();

    const binaryChartData = {
        labels: binaryData.map(item => item.question),
        datasets: [
            {
                label: 'Positive',
                data: binaryData.map(item => item.positiveCount),
                backgroundColor: '#36A2EB', 
                stack: 'Stack 0',
            },
            {
                label: 'Negative',
                data: binaryData.map(item => item.negativeCount),
                backgroundColor: '#FF6384', 
                stack: 'Stack 0',
            }
        ],
    };

    const ratingChartData = {
        labels: ratingData.map(item => item.question),
        datasets: [
            {
                label: 'Average Rating',
                data: ratingData.map(item => item.averageRating),
                backgroundColor: '#FFCE56', 
                borderColor: '#FF9F40', 
                borderWidth: 1,
            }
        ],
    };

    const binaryOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true,
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                stacked: true,
                beginAtZero: true,
            }
        },
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'start',
                labels: {
                    boxWidth: 12,
                    padding: 10
                }
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    afterTitle: function(context) {
                        const dataIndex = context[0].dataIndex;
                        const totalResponses = binaryData[dataIndex].totalCount;
                        return `Total Responses: ${totalResponses}`;
                    }
                }
            }
        },
    };

    const ratingOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                beginAtZero: true,
                max: 10, 
                title: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'start',
                labels: {
                    boxWidth: 12,
                    padding: 10
                }
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    afterTitle: function(context) {
                        const dataIndex = context[0].dataIndex;
                        const responseCount = ratingData[dataIndex].responseCount;
                        return `Responses: ${responseCount}`;
                    }
                }
            }
        },
    };

    return (
        <StatisticsTemplate
            headers={headers}
            data={tableData}
            chart1={
                <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Binary Questions - Positive/Negative Responses</h3>
                    {binaryData.length > 0 ? (
                        <div style={{ flex: 1 }}>
                            <Bar data={binaryChartData} options={binaryOptions} />
                        </div>
                    ) : (
                        <p>No binary questions available</p>
                    )}
                </Box>
            }
            chart2={
                <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Rating Questions - Average Ratings</h3>
                    {ratingData.length > 0 ? (
                        <div style={{ flex: 1 }}>
                            <Bar data={ratingChartData} options={ratingOptions} />
                        </div>
                    ) : (
                        <p>No rating questions available</p>
                    )}
                </Box>
            }
            sidebar={
                <List>
                    {questions.map((question) => (
                        <ListItem key={question.id}>
                            <ListItemButton onClick={() => handleOpenQuestionStatistics(question.id)}>
                                <ListItemText primary={question.description} secondary={question.type} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            }
        />
    );
}