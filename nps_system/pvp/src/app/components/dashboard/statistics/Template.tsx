import React from 'react';
import { Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

interface StatisticsTemplateProps {
    headers: { key: string; label: string }[]; 
    data: Record<string, any>[]; 
    chart1?: React.ReactNode; 
    chart2?: React.ReactNode; 
    sidebar?: React.ReactNode;
    customTable?: React.ReactNode; 
    actions?: React.ReactNode; 
    title?: string; 
}

const StatisticsTemplate: React.FC<StatisticsTemplateProps> = ({ 
    headers, 
    data, 
    chart1, 
    chart2, 
    sidebar,
    customTable,
    actions,
    title = 'Statistics'
}) => {
    return (
        <Box
            sx={{
                marginBottom: 5,
                marginTop: 5,
                height: '100vh',
                p: { xs: 1, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                ml: { md: '100px' },
            }}
        >
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2,
                px: 1
            }}>
                <Typography variant="h5">{title}</Typography>
                {actions}
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            boxShadow: 3,
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
                            boxShadow: 3,
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
                        border: '1px solid #ddd',
                        overflow: 'auto',
                        mb: { xs: 2, md: 0 },
                        mr: { md: sidebar ? 2 : 0 },
                        p: 2,
                    }}
                >
                    {customTable ? (
                        customTable
                    ) : (
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
                    )}
                </Paper>
                {sidebar && (
                    <Box
                        sx={{
                            boxShadow: 3,
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