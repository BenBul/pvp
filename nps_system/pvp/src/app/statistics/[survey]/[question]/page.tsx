'use client';

import QuestionTemplate from "@/app/components/dashboard/statistics/QuestionTemplate";
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from '@/supabase/client';
import { useParams } from "next/navigation";
import LoadingBox from "@/app/components/LoadingBox";
import { Line, Bar, Pie } from 'react-chartjs-2';
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
import {
    Box,
    Paper,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Chip
} from "@mui/material";

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

interface IAnswer {
    created_at: string;
    ispositive?: boolean;
    rating?: number;
    input?: string;
}

const getQuestionType = async (questionId: string) => {
    try {
        const { data, error } = await supabase
            .from('questions')
            .select('type')
            .eq('id', questionId)
            .single();

        if (error) throw error;

        return data?.type;
    } catch (error) {
        console.error("Error getting question type:", error);
        return null;
    }
}

const getQuestionAnswers = async (questionId: string) => {
    try {
        const { data, error } = await supabase
            .from('answers')
            .select('rating, created_at, input, ispositive')
            .eq('question_id', questionId)
            .returns<IAnswer[]>();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error getting answers:", error);
        return null;
    }
}

const transformToBinaryTableData = (answer: IAnswer) => {
    return {
        created_at: new Date(answer.created_at).toLocaleString(),
        ispositive: answer.ispositive ? 'Positive' : 'Negative',
    };
};

export default function QuestionStatistics() {
    type BinaryTableRow = {
        created_at: string;
        ispositive: string;
        date: Date; // For sorting/filtering
    }

    const params = useParams();
    const questionId = params.question as string;
    const [questionType, setQuestionType] = useState('');
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<IAnswer[]>([]);
    const [tableData, setTableData] = useState<BinaryTableRow[]>([]);
    
    // Filter states
    const [responseFilter, setResponseFilter] = useState<string>('all');
    const [startDateStr, setStartDateStr] = useState<string>('');
    const [endDateStr, setEndDateStr] = useState<string>('');

    useEffect(() => {
        setLoading(true);
        if (!questionId) return;
        const fetchQuestion = async () => {
            const type = await getQuestionType(questionId);
            setQuestionType(type);
            const answers = await getQuestionAnswers(questionId);
            setAnswers(answers ?? []);
            if (type === 'binary') {
                const binaryTableData = (answers ?? []).map(answer => ({
                    ...transformToBinaryTableData(answer),
                    date: new Date(answer.created_at)
                }));
                setTableData(binaryTableData);
            }
        };
        fetchQuestion();
        setLoading(false);
    }, [questionId]);

    // Apply filters to the table data
    const filteredTableData = useMemo(() => {
        return tableData.filter(item => {
            // Filter by positive/negative response
            if (responseFilter !== 'all') {
                if (responseFilter === 'positive' && item.ispositive !== 'Positive') return false;
                if (responseFilter === 'negative' && item.ispositive !== 'Negative') return false;
            }
            
            // Filter by date range
            if (startDateStr) {
                const startDate = new Date(startDateStr);
                startDate.setHours(0, 0, 0, 0);
                if (item.date < startDate) return false;
            }
            
            if (endDateStr) {
                const endDate = new Date(endDateStr);
                // Set end date to end of day for inclusive comparison
                endDate.setHours(23, 59, 59, 999);
                if (item.date > endDate) return false;
            }
            
            return true;
        });
    }, [tableData, responseFilter, startDateStr, endDateStr]);

    // Process data for charts based on filtered data
    const processFilteredData = (data: BinaryTableRow[]) => {
        const dataByDate: { [key: string]: { trueCount: number; falseCount: number } } = {};

        data.forEach((row) => {
            const date = row.date.toLocaleDateString();
            if (!dataByDate[date]) {
                dataByDate[date] = { trueCount: 0, falseCount: 0 };
            }
            if (row.ispositive === 'Positive') {
                dataByDate[date].trueCount += 1;
            } else {
                dataByDate[date].falseCount += 1;
            }
        });

        return dataByDate;
    };

    if (loading) {
        return <LoadingBox />;
    }

    const getHeadersForStatistics = (type: string) => {
        switch (type) {
            case 'binary':
                return [
                    { key: 'ispositive', label: 'Positive/Negative' },
                    { key: 'created_at', label: 'Date' },
                ];
            default:
                return [];
        }
    };

    const dataByDate = processFilteredData(filteredTableData);
    const dates = Object.keys(dataByDate);
    const trueCounts = dates.map((date) => dataByDate[date].trueCount);
    const falseCounts = dates.map((date) => dataByDate[date].falseCount);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
    };

    const renderBinaryPieChart = () => {
        const positiveCount = filteredTableData.filter(row => row.ispositive === 'Positive').length;
        const negativeCount = filteredTableData.filter(row => row.ispositive === 'Negative').length;

        const data = {
            labels: ['Positive', 'Negative'],
            datasets: [
                {
                    label: 'Responses',
                    data: [positiveCount, negativeCount],
                    backgroundColor: ['#36A2EB', '#FF6384'],
                    borderWidth: 1,
                },
            ],
        };

        return <Pie data={data} />;
    };

    const lineChartData = {
        labels: dates,
        datasets: [
            {
                label: 'Positive Responses',
                data: trueCounts,
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
            },
            {
                label: 'Negative Responses',
                data: falseCounts,
                borderColor: '#FF6384',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true,
            },
        ],
    };

    const barChartData = {
        labels: dates,
        datasets: [
            {
                label: 'Positive Responses',
                data: trueCounts,
                backgroundColor: '#36A2EB',
            },
            {
                label: 'Negative Responses',
                data: falseCounts,
                backgroundColor: '#FF6384',
            },
        ],
    };

    const headers = getHeadersForStatistics(questionType);

    const filterControls = (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Filter Responses
            </Typography>
            <Grid container spacing={2} alignItems="center">
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
                        label="Start Date"
                        type="date"
                        value={startDateStr}
                        onChange={(e) => setStartDateStr(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        size="small"
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        label="End Date"
                        type="date"
                        value={endDateStr}
                        onChange={(e) => setEndDateStr(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        size="small"
                        fullWidth
                    />
                </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {responseFilter !== 'all' && (
                    <Chip 
                        label={`Response: ${responseFilter === 'positive' ? 'Positive' : 'Negative'}`} 
                        onDelete={() => setResponseFilter('all')} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                    />
                )}
                {startDateStr && (
                    <Chip 
                        label={`From: ${new Date(startDateStr).toLocaleDateString()}`} 
                        onDelete={() => setStartDateStr('')} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                    />
                )}
                {endDateStr && (
                    <Chip 
                        label={`To: ${new Date(endDateStr).toLocaleDateString()}`} 
                        onDelete={() => setEndDateStr('')} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                    />
                )}
            </Box>
        </Paper>
    );

    if (questionType === 'binary') {
        return (
            <QuestionTemplate
                headers={headers}
                data={filteredTableData}
                chart1={
                    <Box sx={{ width: '100%', maxWidth: 400 }}>
                        {renderBinaryPieChart()}
                    </Box>
                }
                chart2={
                    <Box sx={{ width: '100%', height: '100%' }}>
                        <Line data={lineChartData} options={options} />
                    </Box>
                }
                chart3={
                    <Box sx={{ height: '100%', width: '100%'}}>
                        <Bar data={barChartData} options={options} />
                    </Box>
                }
                customTable={
                    <>
                        {filterControls}
                        {/* The default table will be rendered by QuestionTemplate */}
                    </>
                }
            />
        );
    }
}