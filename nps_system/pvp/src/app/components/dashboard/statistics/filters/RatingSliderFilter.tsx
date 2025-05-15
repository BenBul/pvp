import React from 'react';
import { Typography, Box } from '@mui/material';
import { Slider } from '@mui/material';

interface RatingSliderFilterProps {
    value: [number, number] | null;
    onChange: (value: [number, number] | null) => void;
}

const RatingSliderFilter: React.FC<RatingSliderFilterProps> = ({ value, onChange }) => {
    const handleChange = (_: Event, newValue: number | number[]) => {
        if (Array.isArray(newValue) && newValue.length === 2) {
            onChange([newValue[0], newValue[1]]);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography gutterBottom>Rating Range</Typography>
            <Slider
                value={value ?? [1, 5]}
                onChange={handleChange}
                valueLabelDisplay="auto"
                min={1}
                max={5}
                step={1}
                marks={[
                    { value: 1, label: '1' },
                    { value: 2, label: '2' },
                    { value: 3, label: '3' },
                    { value: 4, label: '4' },
                    { value: 5, label: '5' },
                ]}
            />
        </Box>
    );
};

export default RatingSliderFilter;