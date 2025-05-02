'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import StatisticsTemplate from '@/app/components/dashboard/statistics/Template';
import { 
  List, 
  ListItem,
  ListItemButton, 
  ListItemText, 
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Chip,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
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
}

export default function SurveyStatisticsPage() {
    const { survey } = useParams();
    const [questions, setQuestions] = useState<IQuestion[]>([]);
    const [answers, setAnswers] = useState<IAnswer[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    
    // Filter states
    const [ratingFilter, setRatingFilter] = useState<string>('all');
    const [responseFilter, setResponseFilter] = useState<string>('all');
    const [questionFilter, setQuestionFilter] = useState<string>('');

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
            ispositive: answer.ispositive !== undefined ? (answer.ispositive ? 'Yes' : 'No') : 'N/A',
            rating: answer.rating !== undefined ? answer.rating : 'N/A',
            input: answer.input || 'N/A',
            question_id: answer.question_id,
        };
    });

    // Apply filters to the table data
    const filteredTableData = useMemo(() => {
        return tableData.filter(item => {
            // Filter by rating
            if (ratingFilter !== 'all') {
                if (item.rating === 'N/A') return false;
                const rating = Number(item.rating);
                
                if (ratingFilter === '1-3' && (rating < 1 || rating > 3)) return false;
                if (ratingFilter === '4-7' && (rating < 4 || rating > 7)) return false;
                if (ratingFilter === '8-10' && (rating < 8 || rating > 10)) return false;
            }
            
            // Filter by positive/negative response
            if (responseFilter !== 'all') {
                if (responseFilter === 'positive' && item.ispositive !== 'Yes') return false;
                if (responseFilter === 'negative' && item.ispositive !== 'No') return false;
            }
            
            // Filter by question text
            if (questionFilter && !item.question.toLowerCase().includes(questionFilter.toLowerCase())) {
                return false;
            }
            
            return true;
        });
    }, [tableData, ratingFilter, responseFilter, questionFilter]);

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
                max: 5,
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

    const filterControls = (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Filter Responses
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="rating-filter-label">Rating</InputLabel>
                        <Select
                            labelId="rating-filter-label"
                            id="rating-filter"
                            value={ratingFilter}
                            label="Rating"
                            onChange={(e) => setRatingFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Ratings</MenuItem>
                            <MenuItem value="1-3">Low (1-3)</MenuItem>
                            <MenuItem value="4-7">Medium (4-7)</MenuItem>
                            <MenuItem value="8-10">High (8-10)</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="response-filter-label">Response</InputLabel>
                        <Select
                            labelId="response-filter-label"
                            id="response-filter"
                            value={responseFilter}
                            label="Response"
                            onChange={(e) => setResponseFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Responses</MenuItem>
                            <MenuItem value="positive">Positive</MenuItem>
                            <MenuItem value="negative">Negative</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        id="question-filter"
                        label="Search Questions"
                        variant="outlined"
                        size="small"
                        value={questionFilter}
                        onChange={(e) => setQuestionFilter(e.target.value)}
                    />
                </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {ratingFilter !== 'all' && (
                    <Chip 
                        label={`Rating: ${ratingFilter}`} 
                        onDelete={() => setRatingFilter('all')} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                    />
                )}
                {responseFilter !== 'all' && (
                    <Chip 
                        label={`Response: ${responseFilter === 'positive' ? 'Positive' : 'Negative'}`} 
                        onDelete={() => setResponseFilter('all')} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                    />
                )}
                {questionFilter && (
                    <Chip 
                        label={`Search: ${questionFilter}`} 
                        onDelete={() => setQuestionFilter('')} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                    />
                )}
            </Box>
        </Paper>
    );

    const CustomTable = (
        <>
            {filterControls}
            <TableContainer>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {headers.map((header) => (
                                <TableCell
                                    key={header.key}
                                    sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#f5f5f5',
                                    }}
                                >
                                    {header.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTableData.map((row, index) => (
                            <TableRow key={index} hover>
                                {headers.map((header) => (
                                    <TableCell key={header.key}>{row[header.key]}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );

    return (
        <StatisticsTemplate
            headers={headers}
            data={filteredTableData}
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
                                <ListItemText primary={question.description} secondary={question.type}  />
                                {/* is Deleted chip */}
                                {question.isDeleted && <Chip label="Deleted" color="error" size="small" sx={{ ml: 1 }} />}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            }
            customTable={CustomTable}
        />
    );
}