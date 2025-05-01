'use client';

import QuestionTemplate from "@/app/components/dashboard/statistics/QuestionTemplate";
import React, { useEffect, useState } from "react";
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
import { Box } from "@mui/material";

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
    }

    const params = useParams();
    const questionId = params.question as string;
    const [questionType, setQuestionType] = useState('');
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<IAnswer[]>([]);
    const [tableData, setTableData] = useState<BinaryTableRow[]>([]);

    useEffect(() => {
        setLoading(true);
        if (!questionId) return;
        const fetchQuestion = async () => {
            const type = await getQuestionType(questionId);
            setQuestionType(type);
            const answers = await getQuestionAnswers(questionId);
            setAnswers(answers ?? []);
            if (type === 'binary') {
                const binaryTableData = (answers ?? []).map(transformToBinaryTableData);
                setTableData(binaryTableData);
            }
        };
        fetchQuestion();
        setLoading(false);
    }, [questionId]);

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

    const options = {
        responsive: true,
        maintainAspectRatio: false,
    };

    const processData = (answers: IAnswer[]) => {
        const dataByDate: { [key: string]: { trueCount: number; falseCount: number } } = {};

        answers.forEach((answer) => {
            const date = new Date(answer.created_at).toLocaleDateString();
            if (!dataByDate[date]) {
                dataByDate[date] = { trueCount: 0, falseCount: 0 };
            }
            if (answer.ispositive) {
                dataByDate[date].trueCount += 1;
            } else {
                dataByDate[date].falseCount += 1;
            }
        });

        return dataByDate;
    };

    const dataByDate = processData(answers);
    const dates = Object.keys(dataByDate);
    const trueCounts = dates.map((date) => dataByDate[date].trueCount);
    const falseCounts = dates.map((date) => dataByDate[date].falseCount);

    const renderBinaryPieChart = () => {
        const positiveCount = answers.filter(a => a.ispositive).length;
        const negativeCount = answers.filter(a => a.ispositive === false).length;

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

    if (questionType === 'binary') {
        return (
            <Box sx={{ marginLeft: '240px', padding: 2 }}> {/* Atitraukiam nuo sidebar */}
                <QuestionTemplate
                    headers={headers}
                    data={tableData}
                    chart1={
                        <Box sx={{ width: '100%', maxWidth: 400 }}>
                            {renderBinaryPieChart()}
                        </Box>
                    }
                    chart2={
                        <Box sx={{ width: '100%', minHeight: 300 }}>
                            <Line data={lineChartData} options={options} />
                        </Box>
                    }
                    chart3={
                        <Box sx={{ width: '100%', minHeight: 300 }}>
                            <Bar data={barChartData} options={options} />
                        </Box>
                    }
                />
            </Box>
        );
    }
}
