import { NPSData } from '../app/types/survey';

export const createNPSChartConfig = (npsData: NPSData[]) => {
    return {
        type: 'bar',
        data: {
            labels: npsData.map(item => item.question),
            datasets: [
                {
                    type: 'line' as const,
                    label: 'NPS Score',
                    data: npsData.map(item => item.npsScore),
                    borderColor: '#3f51b5',
                    backgroundColor: 'rgba(63, 81, 181, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'y',
                    pointBackgroundColor: npsData.map(item => 
                        item.npsScore >= 50 ? '#66bb6a' : 
                        item.npsScore >= 0 ? '#ffb74d' : '#ff5252'
                    ),
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    order: 0 
                },
                {
                    type: 'bar' as const,
                    label: 'Promoters',
                    data: npsData.map(item => item.promoterPercentage),
                    backgroundColor: 'rgba(102, 187, 106, 0.7)',
                    borderColor: '#2e7d32',
                    borderWidth: 1,
                    yAxisID: 'y1',
                    stack: 'Stack 0',
                    order: 3,
                    categoryPercentage: 0.7,
                    barPercentage: 0.9
                },
                {
                    type: 'bar' as const,
                    label: 'Passives',
                    data: npsData.map(item => item.passivePercentage),
                    backgroundColor: 'rgba(255, 183, 77, 0.7)',
                    borderColor: '#f57c00',
                    borderWidth: 1,
                    yAxisID: 'y1',
                    stack: 'Stack 0',
                    order: 2,
                    categoryPercentage: 0.7,
                    barPercentage: 0.9
                },
                {
                    type: 'bar' as const,
                    label: 'Detractors',
                    data: npsData.map(item => item.detractorPercentage),
                    backgroundColor: 'rgba(255, 82, 82, 0.7)',
                    borderColor: '#c62828',
                    borderWidth: 1,
                    yAxisID: 'y1',
                    stack: 'Stack 0',
                    order: 1,
                    categoryPercentage: 0.7,
                    barPercentage: 0.9
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 5,
                    right: 15, 
                    top: 5,
                    bottom: 5
                }
            },
            scales: {
                x: {
                    title: {
                        display: false
                    },
                    ticks: {
                        autoSkip: true,
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
                    type: 'linear' as const,
                    display: true,
                    position: 'left' as const,
                    title: {
                        display: false 
                    },
                    min: -100,
                    max: 100,
                    ticks: {
                        stepSize: 50, 
                        font: {
                            size: 10 
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y1: {
                    type: 'linear' as const,
                    display: true,
                    position: 'right' as const,
                    title: {
                        display: false 
                    },
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 25, 
                        callback: function(value) {
                            return value + '%';
                        },
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
                tooltip: {
                    callbacks: {
                        title: function(context: any) {
                            return context[0].label;
                        },
                        label: function(context: any) {
                            const datasetLabel = context.dataset.label;
                            const value = context.parsed.y;
                            
                            const rawData = npsData[context.dataIndex];
                            
                            if (datasetLabel === 'NPS Score') {
                                return `NPS Score: ${value}`;
                            } else if (datasetLabel === 'Promoters') {
                                return `Promoters: ${value}% (${rawData.promoters})`;
                            } else if (datasetLabel === 'Passives') {
                                return `Passives: ${value}% (${rawData.passives})`;
                            } else if (datasetLabel === 'Detractors') {
                                return `Detractors: ${value}% (${rawData.detractors})`;
                            }
                            return `${datasetLabel}: ${value}`;
                        },
                        afterBody: function(context: any) {
                            const rawData = npsData[context[0].dataIndex];
                            const questionType = rawData.questionType === 'binary' ? 'Binary' : 'Rating';
                            return [
                                `Total Responses: ${rawData.responseCount}`,
                                `Question Type: ${questionType}`
                            ];
                        }
                    }
                }
            }
        }
    };
};