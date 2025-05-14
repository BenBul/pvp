import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface NPSGaugeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
}

const NPSGauge: React.FC<NPSGaugeProps> = ({ score, size = 'medium' }) => {
  const theme = useTheme();
  
  const gaugeSize = {
    small: 80,
    medium: 120,
    large: 160
  }[size];
  
  const fontSize = {
    small: '1.5rem',
    medium: '2rem',
    large: '2.5rem'
  }[size];
  

  const circumference = 2 * Math.PI * 42; 
  const redSegment = circumference * 0.33; 
  const yellowSegment = circumference * 0.33; 
  const greenSegment = circumference * 0.33; 
  
  const normalizedScore = Math.max(-100, Math.min(100, score)); 
  
  const angle = 210 - ((normalizedScore + 100) / 200) * 240;
  
  return (
    <Box 
      sx={{ 
        position: 'relative', 
        width: gaugeSize, 
        height: gaugeSize,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <svg
        width={gaugeSize}
        height={gaugeSize}
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="8"
        />
        
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#ff5252"
          strokeWidth="8"
          strokeDasharray={`${redSegment} ${circumference}`}
          strokeDashoffset={circumference * 0.75}
          transform="rotate(-210 50 50)"
        />
        
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#ffb74d"
          strokeWidth="8"
          strokeDasharray={`${yellowSegment} ${circumference}`}
          strokeDashoffset={circumference * 0.42}
          transform="rotate(-210 50 50)"
        />
        
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#66bb6a"
          strokeWidth="8"
          strokeDasharray={`${greenSegment} ${circumference}`}
          strokeDashoffset={circumference * 0.09}
          transform="rotate(-210 50 50)"
        />
        
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="20"
          stroke="rgba(0,0,0,0.7)"
          strokeWidth="2"
          transform={`rotate(${angle} 50 50)`}
        />
        
        <circle
          cx="50"
          cy="50"
          r="5"
          fill="white"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="1"
        />
      </svg>
      
      <Typography
        variant="h4"
        sx={{
          position: 'absolute',
          fontSize: fontSize,
          fontWeight: 'bold',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {Math.round(score)}
      </Typography>
    </Box>
  );
};

export default NPSGauge;