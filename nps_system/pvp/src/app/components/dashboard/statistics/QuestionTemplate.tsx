import React from 'react';
import {
    Box,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';

interface QuestionTemplateProps {
    headers: { key: string; label: string }[];
    data: Record<string, any>[];
    chart1?: React.ReactNode;
    chart2?: React.ReactNode;
    chart3?: React.ReactNode;
    chart4?: React.ReactNode;
}

const QuestionTemplate: React.FC<QuestionTemplateProps> = ({ headers, data, chart1, chart2, chart3, chart4 }) => {
    return (
        <Box sx={{ height: '100vh', p: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column' }}>
            {/* Chart Grid */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={chartBoxStyle}>{chart1}</Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={chartBoxStyle}>{chart2}</Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={chartBoxStyle}>{chart3}</Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={chartBoxStyle}>{chart4}</Paper>
                </Grid>
            </Grid>

            {/* Table */}
            <Paper sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {headers.map((header) => (
                                    <TableCell
                                        key={header.key}
                                        sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}
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
                                        <TableCell key={header.key}>{row[header.key]}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

const chartBoxStyle = {
    height: { xs: 200, md: 300 },
    p: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

export default QuestionTemplate;