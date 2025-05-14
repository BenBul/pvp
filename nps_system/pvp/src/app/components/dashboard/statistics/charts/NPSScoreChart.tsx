import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Chart } from 'react-chartjs-2';
import { NPSData } from '../../../../types/survey';
import { createNPSChartConfig } from '@/utils/npsChartConfig'; 

interface NPSScoreChartProps {
    npsData: NPSData[];
}

const NPSScoreChart: React.FC<NPSScoreChartProps> = ({ npsData }) => {
    const chartConfig = createNPSChartConfig(npsData);
    
    return (
        <Box sx={{ 
            height: '100%', 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column'
        }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                NPS Score Distribution (All Questions)
            </Typography>
            {npsData.length > 0 ? (
                <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative' 
                }}>
                    <Chart 
                        type="bar"
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
                        No questions with responses available
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        Add rating or binary questions to see NPS distribution
                    </Typography>
                </Box>
            )}
            
            {npsData.length > 0 && (
                <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                        icon={<div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'rgba(102, 187, 106, 0.7)' }}></div>}
                        label="Promoters/Positive" 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontSize: '0.6rem', height: 20 }}
                    />
                    <Chip 
                        icon={<div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'rgba(255, 183, 77, 0.7)' }}></div>}
                        label="Passives" 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontSize: '0.6rem', height: 20 }}
                    />
                    <Chip 
                        icon={<div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'rgba(255, 82, 82, 0.7)' }}></div>}
                        label="Detractors/Negative" 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontSize: '0.6rem', height: 20 }}
                    />
                    <Chip 
                        icon={<div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3f51b5' }}></div>}
                        label="NPS Score" 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontSize: '0.6rem', height: 20 }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default NPSScoreChart;