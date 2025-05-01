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

type BinaryTableRow = {
    created_at: string;
    ispositive: string;
    date: Date;
};

export default function QuestionStatistics() {
    const params = useParams();
    const questionId = params.question as string;

    const [questionType, setQuestionType] = useState('');
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<IAnswer[]>([]);
    const [tableData, setTableData] = useState<BinaryTableRow[]>([]);

    const [responseFilter, setResponseFilter] = useState<string>('all');
    const [startDateStr, setStartDateStr] = useState<string>('');
    const [endDateStr, setEndDateStr] = useState<string>('');

    useEffect(() => {
        if (!questionId) return;

        const fetchData = async () => {
            setLoading(true);
            const { data: typeData } = await supabase
                .from('questions')
                .select('type')
                .eq('id', questionId)
                .single();

            setQuestionType(typeData?.type || '');

            const { data: answersData } = await supabase
                .from('answers')
                .select('rating, created_at, input, ispositive')
                .eq('question_id', questionId)
                .returns<IAnswer[]>();

            setAnswers(answersData || []);

            if (typeData?.type === 'binary') {
                const binaryData = (answersData || []).map(ans => ({
                    created_at: new Date(ans.created_at).toLocaleString(),
                    ispositive: ans.ispositive ? 'Positive' : 'Negative',
                    date: new Date(ans.created_at)
                }));
                setTableData(binaryData);
            }

            setLoading(false);
        };

        fetchData();
    }, [questionId]);

    const filteredTableData = useMemo(() => {
        return tableData.filter(item => {
            if (responseFilter !== 'all') {
                if (responseFilter === 'positive' && item.ispositive !== 'Positive') return false;
                if (responseFilter === 'negative' && item.ispositive !== 'Negative') return false;
            }

            if (startDateStr) {
                const start = new Date(startDateStr);
                start.setHours(0, 0, 0, 0);
                if (item.date < start) return false;
            }

            if (endDateStr) {
                const end = new Date(endDateStr);
                end.setHours(23, 59, 59, 999);
                if (item.date > end) return false;
            }

            return true;
        });
    }, [tableData, responseFilter, startDateStr, endDateStr]);

    const processFilteredData = (data: BinaryTableRow[]) => {
        const grouped: Record<string, { trueCount: number; falseCount: number }> = {};
        data.forEach(row => {
            const date = row.date.toLocaleDateString();
            if (!grouped[date]) grouped[date] = { trueCount: 0, falseCount: 0 };
            if (row.ispositive === 'Positive') grouped[date].trueCount++;
            else grouped[date].falseCount++;
        });
        return grouped;
    };

    const dataByDate = processFilteredData(filteredTableData);
    const dates = Object.keys(dataByDate);
    const trueCounts = dates.map(date => dataByDate[date].trueCount);
    const falseCounts = dates.map(date => dataByDate[date].falseCount);

    const pieData = {
        labels: ['Positive', 'Negative'],
        datasets: [{
            label: 'Responses',
            data: [
                filteredTableData.filter(r => r.ispositive === 'Positive').length,
                filteredTableData.filter(r => r.ispositive === 'Negative').length
            ],
            backgroundColor: ['#36A2EB', '#FF6384']
        }]
    };

    const lineData = {
        labels: dates,
        datasets: [
            {
                label: 'Positive',
                data: trueCounts,
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54,162,235,0.2)',
                fill: true,
            },
            {
                label: 'Negative',
                data: falseCounts,
                borderColor: '#FF6384',
                backgroundColor: 'rgba(255,99,132,0.2)',
                fill: true,
            },
        ]
    };

    const barData = {
        labels: dates,
        datasets: [
            {
                label: 'Positive',
                data: trueCounts,
                backgroundColor: '#36A2EB',
            },
            {
                label: 'Negative',
                data: falseCounts,
                backgroundColor: '#FF6384',
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false
    };

    const headers = [
        { key: 'ispositive', label: 'Positive/Negative' },
        { key: 'created_at', label: 'Date' },
    ];

    const filterControls = (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Filter Responses</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Response</InputLabel>
                        <Select
                            value={responseFilter}
                            onChange={(e) => setResponseFilter(e.target.value)}
                            label="Response"
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="positive">Positive</MenuItem>
                            <MenuItem value="negative">Negative</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        label="Start Date"
                        type="date"
                        fullWidth
                        value={startDateStr}
                        onChange={(e) => setStartDateStr(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        label="End Date"
                        type="date"
                        fullWidth
                        value={endDateStr}
                        onChange={(e) => setEndDateStr(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                    />
                </Grid>
            </Grid>

            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {responseFilter !== 'all' && (
                    <Chip label={`Filter: ${responseFilter}`} onDelete={() => setResponseFilter('all')} />
                )}
                {startDateStr && (
                    <Chip label={`From: ${new Date(startDateStr).toLocaleDateString()}`} onDelete={() => setStartDateStr('')} />
                )}
                {endDateStr && (
                    <Chip label={`To: ${new Date(endDateStr).toLocaleDateString()}`} onDelete={() => setEndDateStr('')} />
                )}
            </Box>
        </Paper>
    );

    if (loading) return <LoadingBox />;

    if (questionType === 'binary') {
        return (
            <Box sx={{ ml: '240px', p: 2 }}>
                <QuestionTemplate
                    headers={headers}
                    data={filteredTableData}
                    chart1={
                        <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
                            <Pie data={pieData} />
                        </Box>
                    }
                    chart2={
                        <Box sx={{ height: 300 }}>
                            <Line data={lineData} options={options} />
                        </Box>
                    }
                    chart3={
                        <Box sx={{ height: 300 }}>
                            <Bar data={barData} options={options} />
                        </Box>
                    }
                    customTable={filterControls}
                />
            </Box>
        );
    }

    return null;
}
