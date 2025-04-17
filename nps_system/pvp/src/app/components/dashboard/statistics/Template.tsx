import React from 'react';
import { Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

interface StatisticsTemplateProps {
    headers: { key: string; label: string }[]; // Array of key-label pairs for table headers
    data: Record<string, any>[]; // Array of objects for table rows
    chart1?: React.ReactNode; // Slot for the first chart
    chart2?: React.ReactNode; // Slot for the second chart
    sidebar?: React.ReactNode; // Optional sidebar for the right of the table
}

const StatisticsTemplate: React.FC<StatisticsTemplateProps> = ({ headers, data, chart1, chart2, sidebar }) => {
    return (
        <Box
            sx={{
                height: '100vh',
                p: { xs: 1, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                ml: { md: '100px' }, // 💥 ŠITAS PRIDĖTA – kad kompensuotų Drawer
            }}
        >
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            height: { xs: 200, md: 300 },
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {chart1}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            height: { xs: 200, md: 300 },
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {chart2}
                    </Paper>
                </Grid>
            </Grid>
            <Box
                sx={{
                    display: 'flex',
                    flex: 1,
                    overflow: 'hidden',
                    flexDirection: { xs: 'column', md: 'row' },
                }}
            >
                <Paper
                    sx={{
                        flex: 1,
                        overflow: 'auto',
                        mb: { xs: 2, md: 0 },
                        mr: { md: sidebar ? 2 : 0 },
                        p: 2,
                    }}
                >
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
                                            <TableCell key={header.key}>{row[header.key]}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
                {sidebar && (
                    <Box
                        sx={{
                            borderRadius: 2,
                            width: { xs: '100%', md: 300 },
                            bgcolor: 'background.paper',
                            borderLeft: { md: '1px solid #ddd' },
                            p: 2,
                            overflowY: 'auto',
                        }}
                    >
                        {sidebar}
                    </Box>
                )}
            </Box>
        </Box>
    );
};


export default StatisticsTemplate;