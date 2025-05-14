import React from 'react';
import { Box, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { BinaryData } from '../../../../types/survey';
import { createBinaryChartConfig } from '@/utils/charts/binaryChartConfig';

interface BinaryQuestionsChartProps {
    binaryData: BinaryData[];
}

const BinaryQuestionsChart: React.FC<BinaryQuestionsChartProps> = ({ binaryData }) => {
    const chartConfig = createBinaryChartConfig(binaryData);
    
    return (
        <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Binary Questions - Positive/Negative Responses
            </Typography>
            {binaryData.length > 0 ? (
                <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative'
                }}>
                    <Bar 
                        data={chartConfig.data} 
                        options={chartConfig.options}
                        style={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}
                    />
                </Box>
            ) : (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%' 
                }}>
                    <Typography variant="body2" color="text.secondary">
                        No binary questions available
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default BinaryQuestionsChart;