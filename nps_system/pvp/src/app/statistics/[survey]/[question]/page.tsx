'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { supabase } from '@/supabase/client';
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
    Tooltip as ChartTooltip,
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
    Chip,
    Button,
    CircularProgress,
    Tooltip as MuiTooltip,
    Container,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Card,
    CardContent,
    Divider
} from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import QuizIcon from '@mui/icons-material/Quiz';
import BarChartIcon from '@mui/icons-material/BarChart';
import TextFieldsIcon from '@mui/icons-material/TextFields';

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

// Define chart container styles
const chartContainerStyles = {
    height: 300,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2
};

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

type RatingTableRow = {
    created_at: string;
    rating: number;
    date: Date;
    input?: string;
};

type TextTableRow = {
    created_at: string;
    input: string;
    date: Date;
};

export default function QuestionStatistics() {
    const params = useParams();
    const questionId = params.question as string;
    const surveyId = params.survey as string;

    const [questionType, setQuestionType] = useState('');
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<IAnswer[]>([]);
    const [tableData, setTableData] = useState<BinaryTableRow[]>([]);
    const [ratingTableData, setRatingTableData] = useState<RatingTableRow[]>([]);
    const [textTableData, setTextTableData] = useState<TextTableRow[]>([]);
    const [questionTitle, setQuestionTitle] = useState('Question Statistics');
    const [exporting, setExporting] = useState(false);

    // Filter states
    const [responseFilter, setResponseFilter] = useState<string>('all');
    const [startDateStr, setStartDateStr] = useState<string>('');
    const [endDateStr, setEndDateStr] = useState<string>('');
    const [minRating, setMinRating] = useState<string>('');
    const [maxRating, setMaxRating] = useState<string>('');
    const [textFilter, setTextFilter] = useState<string>('');

    useEffect(() => {
        if (!questionId) return;
        const fetchData = async () => {
            setLoading(true);
            const { data: questionData, error: questionError } = await supabase
                .from('questions')
                .select('type, description')
                .eq('id', questionId)
                .single();

            if (questionError) {
                console.error('Error fetching question:', questionError);
                setLoading(false);
                return;
            }

            setQuestionType(questionData?.type || '');
            setQuestionTitle(questionData?.description || 'Question Statistics');

            const { data: answersData, error: answersError } = await supabase
                .from('answers')
                .select('rating, created_at, input, ispositive')
                .eq('question_id', questionId)
                .returns<IAnswer[]>();

            if (answersError) {
                console.error('Error fetching answers:', answersError);
                setLoading(false);
                return;
            }

            setAnswers(answersData || []);

            if (questionData?.type === 'binary') {
                const binaryData = (answersData || []).map(ans => ({
                    created_at: new Date(ans.created_at).toLocaleString(),
                    ispositive: ans.ispositive ? 'Positive' : 'Negative',
                    date: new Date(ans.created_at)
                }));
                setTableData(binaryData);
            }

            if (questionData?.type === 'rating') {
                const ratingData = (answersData || [])
                    .filter(ans => typeof ans.rating === 'number')
                    .map(ans => ({
                        created_at: new Date(ans.created_at).toLocaleString(),
                        rating: ans.rating!,
                        input: ans.input || '',
                        date: new Date(ans.created_at)
                    }));
                setRatingTableData(ratingData);
            }

            if (questionData?.type === 'text') {
                const textData = (answersData || [])
                    .filter(ans => ans.input && ans.input.trim() !== '')
                    .map(ans => ({
                        created_at: new Date(ans.created_at).toLocaleString(),
                        input: ans.input || '',
                        date: new Date(ans.created_at)
                    }));
                setTextTableData(textData);
            }

            setLoading(false);
        };

        fetchData();
    }, [questionId]);

    const handleExportToCsv = async () => {
        setExporting(true);
        try {
            let filename = `${questionTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
            let csvContent = "";
            
            // Create different CSV content based on question type
            if (questionType === 'binary') {
                csvContent = "Response,Date\n";
                filteredTableData.forEach(row => {
                    csvContent += `${row.ispositive},${new Date(row.date).toLocaleDateString()}\n`;
                });
                filename += "_binary_responses.csv";
            } 
            else if (questionType === 'rating') {
                csvContent = "Rating,Date,Comment\n";
                filteredRatingData.forEach(row => {
                    const comment = row.input ? `"${row.input.replace(/"/g, '""')}"` : "";
                    csvContent += `${row.rating},${new Date(row.date).toLocaleDateString()},${comment}\n`;
                });
                filename += "_rating_responses.csv";
            } 
            else if (questionType === 'text') {
                csvContent = "Response,Date\n";
                filteredTextData.forEach(row => {
                    const cleanInput = `"${row.input.replace(/"/g, '""')}"`;
                    csvContent += `${cleanInput},${new Date(row.date).toLocaleDateString()}\n`;
                });
                filename += "_text_responses.csv";
            }
            
            // Create and trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error("Error exporting question data:", error);
        } finally {
            setExporting(false);
        }
    };

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

    const filteredRatingData = useMemo(() => {
        return ratingTableData.filter(item => {
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

            if (minRating && item.rating < parseInt(minRating)) return false;
            if (maxRating && item.rating > parseInt(maxRating)) return false;

            return true;
        });
    }, [ratingTableData, startDateStr, endDateStr, minRating, maxRating]);

    const filteredTextData = useMemo(() => {
        return textTableData.filter(item => {
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

            if (textFilter && !item.input.toLowerCase().includes(textFilter.toLowerCase())) {
                return false;
            }

            return true;
        });
    }, [textTableData, startDateStr, endDateStr, textFilter]);

    // Data preparation functions and useMemo declarations remain the same
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

    // Chart data preparations
    const pieData = {
        labels: ['Positive', 'Negative'],
        datasets: [{
            label: 'Responses',
            data: [
                filteredTableData.filter(r => r.ispositive === 'Positive').length,
                filteredTableData.filter(r => r.ispositive === 'Negative').length
            ],
            backgroundColor: ['#36A2EB', '#FF6384'],
            borderWidth: 1
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
                tension: 0.1
            },
            {
                label: 'Negative',
                data: falseCounts,
                borderColor: '#FF6384',
                backgroundColor: 'rgba(255,99,132,0.2)',
                fill: true,
                tension: 0.1
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
                borderWidth: 1
            },
            {
                label: 'Negative',
                data: falseCounts,
                backgroundColor: '#FF6384',
                borderWidth: 1
            }
        ]
    };

    const ratingLineData = useMemo(() => {
        const grouped: Record<string, number[]> = {};
        filteredRatingData.forEach(row => {
            const date = row.date.toLocaleDateString();
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(row.rating);
        });

        const dates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        const avgRatings = dates.map(date => {
            const values = grouped[date];
            return values.reduce((a, b) => a + b, 0) / values.length;
        });

        return {
            labels: dates,
            datasets: [{
                label: 'Average Rating',
                data: avgRatings,
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54,162,235,0.2)',
                fill: true,
                tension: 0.1
            }]
        };
    }, [filteredRatingData]);

    const ratingHistogramData = useMemo(() => {
        const ratingCounts = [1, 2, 3, 4, 5].map(rating =>
            filteredRatingData.filter(r => r.rating === rating).length
        );

        return {
            labels: ['1', '2', '3', '4', '5'],
            datasets: [{
                label: 'Ratings Count',
                data: ratingCounts,
                backgroundColor: '#36A2EB',
                borderWidth: 1
            }]
        };
    }, [filteredRatingData]);

    const cumulativeRatingData = useMemo(() => {
        const grouped: Record<string, number[]> = {};
        filteredRatingData.forEach(row => {
            const date = row.date.toLocaleDateString();
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(row.rating);
        });

        const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        const cumulativeAverages: number[] = [];
        let total = 0;
        let count = 0;

        sortedDates.forEach(date => {
            const ratings = grouped[date];
            ratings.forEach(r => {
                total += r;
                count += 1;
            });
            cumulativeAverages.push(total / count);
        });

        return {
            labels: sortedDates,
            datasets: [{
                label: 'Cumulative Avg Rating',
                data: cumulativeAverages,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: true,
                tension: 0.1
            }]
        };
    }, [filteredRatingData]);

    const textResponseCountData = useMemo(() => {
        const grouped: Record<string, number> = {};
        filteredTextData.forEach(row => {
            const date = row.date.toLocaleDateString();
            grouped[date] = (grouped[date] || 0) + 1;
        });

        const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        return {
            labels: sortedDates,
            datasets: [{
                label: 'Text Responses Count',
                data: sortedDates.map(date => grouped[date]),
                borderColor: '#9C27B0',
                backgroundColor: 'rgba(156, 39, 176, 0.2)',
                fill: true,
                tension: 0.1
            }]
        };
    }, [filteredTextData]);

    // Chart options with optimal settings
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    boxWidth: 12,
                    font: {
                        size: 11
                    },
                    padding: 8
                }
            },
            tooltip: {
                enabled: true,
                mode: 'index' as const,
                intersect: false
            }
        },
        layout: {
            padding: {
                top: 5,
                right: 10,
                bottom: 5,
                left: 5
            }
        }
    };

    // Specific options for line charts
    const lineOptions = {
        ...baseOptions,
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                        size: 10
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    font: {
                        size: 10
                    }
                }
            }
        },
        elements: {
            line: {
                borderWidth: 2
            },
            point: {
                radius: 3,
                hitRadius: 10,
                hoverRadius: 4
            }
        }
    };

    // Specific options for bar charts
    const barOptions = {
        ...baseOptions,
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                        size: 10
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    font: {
                        size: 10
                    }
                }
            }
        }
    };

    // Specific options for pie charts
    const pieOptions = {
        ...baseOptions,
        cutout: '0%',
        radius: '85%'
    };

    const headers = [
        { key: 'ispositive', label: 'Positive/Negative' },
        { key: 'created_at', label: 'Date' },
    ];

    const ratingHeaders = [
        { key: 'rating', label: 'Rating' },
        { key: 'created_at', label: 'Date' },
        { key: 'input', label: 'Comment' },
    ];

    const textHeaders = [
        { key: 'input', label: 'Response' },
        { key: 'created_at', label: 'Date' },
    ];

    const filterControls = (
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="500">Filter Responses</Typography>
                <MuiTooltip title="Export filtered responses to CSV">
                    <span>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={exporting ? <CircularProgress size={20} /> : <FileDownloadIcon />}
                            onClick={handleExportToCsv}
                            disabled={exporting || (
                                (questionType === 'binary' && filteredTableData.length === 0) ||
                                (questionType === 'rating' && filteredRatingData.length === 0) ||
                                (questionType === 'text' && filteredTextData.length === 0)
                            )}
                        >
                            {exporting ? 'Exporting...' : 'Export to CSV'}
                        </Button>
                    </span>
                </MuiTooltip>
            </Box>
            
            <Grid container spacing={2}>
                {questionType === 'binary' && (
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
                )}
                {questionType === 'rating' && (
                    <>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Min Rating"
                                type="number"
                                fullWidth
                                value={minRating}
                                onChange={(e) => setMinRating(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                inputProps={{ min: 1, max: 5 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Max Rating"
                                type="number"
                                fullWidth
                                value={maxRating}
                                onChange={(e) => setMaxRating(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                inputProps={{ min: 1, max: 5 }}
                            />
                        </Grid>
                    </>
                )}
                {questionType === 'text' && (
                    <Grid item xs={12}>
                        <TextField
                            label="Search Responses"
                            fullWidth
                            value={textFilter}
                            onChange={(e) => setTextFilter(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                    </Grid>
                )}
                <Grid item xs={12} md={questionType === 'text' ? 6 : (questionType === 'binary' ? 4 : 6)}>
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
                <Grid item xs={12} md={questionType === 'text' ? 6 : (questionType === 'binary' ? 4 : 6)}>
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
                {questionType === 'binary' && responseFilter !== 'all' && (
                    <Chip label={`Filter: ${responseFilter}`} onDelete={() => setResponseFilter('all')} />
                )}
                {questionType === 'rating' && minRating && (
                    <Chip label={`Min Rating: ${minRating}`} onDelete={() => setMinRating('')} />
                )}
                {questionType === 'rating' && maxRating && (
                    <Chip label={`Max Rating: ${maxRating}`} onDelete={() => setMaxRating('')} />
                )}
                {questionType === 'text' && textFilter && (
                    <Chip label={`Text: "${textFilter}"`} onDelete={() => setTextFilter('')} />
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

    // Function to render charts based on question type
    const renderCharts = () => {
        if (questionType === 'binary') {
            return (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                            <Typography variant="h6" align="center" gutterBottom>Response Distribution</Typography>
                            <Box sx={chartContainerStyles}>
                                <Box sx={{ width: '80%', height: '80%', maxWidth: 250 }}>
                                    <Pie data={pieData} options={pieOptions} />
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                            <Typography variant="h6" align="center" gutterBottom>Responses Over Time</Typography>
                            <Box sx={chartContainerStyles}>
                                <Line data={lineData} options={lineOptions} />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                            <Typography variant="h6" align="center" gutterBottom>Response Comparison by Date</Typography>
                            <Box sx={chartContainerStyles}>
                                <Bar data={barData} options={barOptions} />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            );
        } else if (questionType === 'rating') {
            return (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                            <Typography variant="h6" align="center" gutterBottom>Rating Distribution</Typography>
                            <Box sx={chartContainerStyles}>
                                <Bar data={ratingHistogramData} options={barOptions} />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                            <Typography variant="h6" align="center" gutterBottom>Average Rating Over Time</Typography>
                            <Box sx={chartContainerStyles}>
                                <Line data={ratingLineData} options={lineOptions} />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                            <Typography variant="h6" align="center" gutterBottom>Cumulative Average Rating</Typography>
                            <Box sx={chartContainerStyles}>
                                <Line data={cumulativeRatingData} options={lineOptions} />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            );
        } else if (questionType === 'text') {
            return (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                            <Typography variant="h6" align="center" gutterBottom>Text Responses Over Time</Typography>
                            <Box sx={chartContainerStyles}>
                                <Line data={textResponseCountData} options={lineOptions} />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            );
        }
        return null;
    };

    // Function to render the appropriate data table based on question type
    const renderDataTable = () => {
        let currentHeaders: { key: string, label: string }[];
        let currentData: any[];

        if (questionType === 'binary') {
            currentHeaders = headers;
            currentData = filteredTableData;
        } else if (questionType === 'rating') {
            currentHeaders = ratingHeaders;
            currentData = filteredRatingData;
        } else if (questionType === 'text') {
            currentHeaders = textHeaders;
            currentData = filteredTextData;
        } else {
            return null;
        }

        return (
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {currentHeaders.map((header) => (
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
                        {currentData.map((row, index) => (
                            <TableRow key={index} hover>
                                {currentHeaders.map((header) => (
                                    <TableCell key={header.key}>
                                        {row[header.key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {currentData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={currentHeaders.length} align="center" sx={{ py: 4 }}>
                                    No data available with current filters
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    // Get the question type icon
    const getQuestionTypeIcon = () => {
        if (questionType === 'binary') {
            return <QuizIcon fontSize="large" sx={{ color: '#1976d2' }} />;
        } else if (questionType === 'rating') {
            return <BarChartIcon fontSize="large" sx={{ color: '#1976d2' }} />;
        } else if (questionType === 'text') {
            return <TextFieldsIcon fontSize="large" sx={{ color: '#1976d2' }} />;
        }
        return null;
    };

    // Determine the type display text
    const getQuestionTypeText = () => {
        if (questionType === 'binary') {
            return 'Binary Question';
        } else if (questionType === 'rating') {
            return 'Rating Question (1-5)';
        } else if (questionType === 'text') {
            return 'Text Feedback Question';
        }
        return 'Question';
    };

    // Get the response count
    const getResponseCount = () => {
        if (questionType === 'binary') {
            return filteredTableData.length;
        } else if (questionType === 'rating') {
            return filteredRatingData.length;
        } else if (questionType === 'text') {
            return filteredTextData.length;
        }
        return 0;
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Improved Header with Cards for Question Information */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                    <Card elevation={2} sx={{ borderRadius: 2, overflow: 'auto' }}>
                        <Box sx={{ bgcolor: '#f5f8fa', px: 3, py: 2, borderBottom: '1px solid #e0e0e0' }}>
                            <Typography variant="h4" fontWeight="500" gutterBottom>{questionTitle}</Typography>
                        </Box>
                        
                        <Grid container sx={{ px: 3, py: 3 }}>
                            <Grid item xs={12} sm={8}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
                                    {getQuestionTypeIcon()}
                                    <Box sx={{ ml: 2 }}>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            Question Type
                                        </Typography>
                                        <Typography variant="h6" fontWeight="500">
                                            {getQuestionTypeText()}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, height: '100%' }}>
                                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            Total Responses
                                        </Typography>
                                        <Typography variant="h4" fontWeight="500" color="primary">
                                            {getResponseCount()}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
            </Grid>
            
            {/* Render charts */}
            {renderCharts()}
            
            {/* Filter controls above data table */}
            {filterControls}
            
            {/* Data table */}
            {renderDataTable()}
        </Container>
    );
}