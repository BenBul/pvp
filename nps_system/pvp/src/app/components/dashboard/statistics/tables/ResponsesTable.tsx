import React, { useState } from 'react';
import { 
    TableContainer, 
    Table, 
    TableHead, 
    TableBody, 
    TableRow, 
    TableCell, 
    Box, 
    Button, 
    CircularProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import { TableData } from '../../../../types/survey';
import ResponseFilters from '../filters/ResponseFilters';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { exportResponsesToCsv } from '@/utils/exportUtils';

interface ResponsesTableProps {
    headers: { key: keyof TableData; label: string }[];
    data: TableData[];
    ratingFilter: string;
    responseFilter: string;
    questionFilter: string;
    ratingRangeFilter: [number, number] | null;
    surveyTitle: string;
    onRatingFilterChange: (value: string) => void;
    onResponseFilterChange: (value: string) => void;
    onQuestionFilterChange: (value: string) => void;
    onRatingRangeFilterChange: (value: [number, number] | null) => void;
}

const ResponsesTable: React.FC<ResponsesTableProps> = ({
    headers,
    data,
    ratingFilter,
    responseFilter,
    questionFilter,
    ratingRangeFilter,
    surveyTitle,
    onRatingFilterChange,
    onResponseFilterChange,
    onQuestionFilterChange,
    onRatingRangeFilterChange
}) => {
    const [exporting, setExporting] = useState(false);
    
    const handleExport = async () => {
        setExporting(true);
        try {
            await exportResponsesToCsv(data, surveyTitle);
        } catch (error) {
            console.error('Error exporting responses:', error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                mb: 2 
            }}>
                <Box sx={{ flex: '1 1 auto' }}>
                    <ResponseFilters
                        ratingFilter={ratingFilter}
                        responseFilter={responseFilter}
                        questionFilter={questionFilter}
                        ratingRangeFilter={ratingRangeFilter}
                        onRatingFilterChange={onRatingFilterChange}
                        onResponseFilterChange={onResponseFilterChange}
                        onQuestionFilterChange={onQuestionFilterChange}
                        onRatingRangeFilterChange={onRatingRangeFilterChange}
                    />
                </Box>
                <Box sx={{ flex: '0 0 auto', ml: 1 }}>
                    <Tooltip title="Export filtered responses to CSV">
                        <span>
                            <IconButton
                                color="primary"
                                onClick={handleExport}
                                disabled={exporting || data.length === 0}
                                size="small"
                            >
                                {exporting ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    <FileDownloadIcon />
                                )}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            </Box>
            
            <TableContainer>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {headers.map((header) => (
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
                        {data.map((row, index) => (
                            <TableRow key={index} hover>
                                {headers.map((header) => (
                                    <TableCell key={header.key}>
                                        {row[header.key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default ResponsesTable;