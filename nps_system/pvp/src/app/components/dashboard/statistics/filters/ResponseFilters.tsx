import React from 'react';
import { 
    Paper, 
    Typography, 
    Grid, 
    Box, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    TextField, 
    Chip, 
    SelectChangeEvent 
} from '@mui/material';

interface ResponseFiltersProps {
    ratingFilter: string;
    responseFilter: string;
    questionFilter: string;
    onRatingFilterChange: (value: string) => void;
    onResponseFilterChange: (value: string) => void;
    onQuestionFilterChange: (value: string) => void;
}

const ResponseFilters: React.FC<ResponseFiltersProps> = ({
    ratingFilter,
    responseFilter,
    questionFilter,
    onRatingFilterChange,
    onResponseFilterChange,
    onQuestionFilterChange
}) => {
    const handleRatingChange = (event: SelectChangeEvent) => {
        onRatingFilterChange(event.target.value);
    };
    
    const handleResponseChange = (event: SelectChangeEvent) => {
        onResponseFilterChange(event.target.value);
    };
    
    const handleQuestionFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onQuestionFilterChange(event.target.value);
    };
    
    return (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Filter Responses
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="rating-filter-label">Rating</InputLabel>
                        <Select
                            labelId="rating-filter-label"
                            id="rating-filter"
                            value={ratingFilter}
                            label="Rating"
                            onChange={handleRatingChange}
                        >
                            <MenuItem value="all">All Ratings</MenuItem>
                            <MenuItem value="1-3">Low (1-3)</MenuItem>
                            <MenuItem value="4-7">Medium (4-7)</MenuItem>
                            <MenuItem value="8-10">High (8-10)</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="response-filter-label">Response</InputLabel>
                        <Select
                            labelId="response-filter-label"
                            id="response-filter"
                            value={responseFilter}
                            label="Response"
                            onChange={handleResponseChange}
                        >
                            <MenuItem value="all">All Responses</MenuItem>
                            <MenuItem value="positive">Positive</MenuItem>
                            <MenuItem value="negative">Negative</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        id="question-filter"
                        label="Search Questions"
                        variant="outlined"
                        size="small"
                        value={questionFilter}
                        onChange={handleQuestionFilterChange}
                    />
                </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {ratingFilter !== 'all' && (
                    <Chip 
                        label={`Rating: ${ratingFilter}`} 
                        onDelete={() => onRatingFilterChange('all')} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                    />
                )}
                {responseFilter !== 'all' && (
                    <Chip 
                        label={`Response: ${responseFilter === 'positive' ? 'Positive' : 'Negative'}`} 
                        onDelete={() => onResponseFilterChange('all')} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                    />
                )}
                {questionFilter && (
                    <Chip 
                        label={`Search: ${questionFilter}`} 
                        onDelete={() => onQuestionFilterChange('')} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                    />
                )}
            </Box>
        </Paper>
    );
};

export default ResponseFilters;