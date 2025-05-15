import { BinaryData } from '../../app/types/survey';

export const createBinaryChartConfig = (binaryData: BinaryData[]) => {
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

    const binaryOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true,
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                        size: 10 
                    }
                },
                grid: {
                    display: false
                }
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 10 
                    }
                },
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'start' as 'start',
                labels: {
                    boxWidth: 10,
                    padding: 6,
                    font: {
                        size: 10 
                    }
                }
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    afterTitle: function(context: any) {
                        const dataIndex = context[0].dataIndex;
                        const totalResponses = binaryData[dataIndex].totalCount;
                        return `Total Responses: ${totalResponses}`;
                    }
                }
            }
        },
    };

    return { data: binaryChartData, options: binaryOptions };
};