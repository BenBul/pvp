import React from 'react';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { TableData } from '../../../../types/survey';
import ResponseFilters from '../filters/ResponseFilters';

interface ResponsesTableProps {
    headers: { key: keyof TableData; label: string }[];
    data: TableData[];
    ratingFilter: string;
    responseFilter: string;
    questionFilter: string;
    ratingRangeFilter: [number, number] | null;
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
    onRatingFilterChange,
    onResponseFilterChange,
    onQuestionFilterChange,
    onRatingRangeFilterChange
}) => {
    return (
        <>
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