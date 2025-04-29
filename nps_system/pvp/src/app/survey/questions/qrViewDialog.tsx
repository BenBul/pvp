'use client';

import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    CircularProgress,
    Menu,
    MenuItem
} from '@mui/material';
import { Close as CloseIcon, FileUpload as FileUploadIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';

type QrViewDialogProps = {
    open: boolean;
    url: string | null;
    type: 'positive' | 'negative';
    onClose: () => void;
};

const QrViewDialog: React.FC<QrViewDialogProps> = ({ open, url, type, onClose }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const navigateToQrUrl = () => {
        if (url) {
            window.open(url, '_blank');
        }
        onClose();
    };

    const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleExportOption = async (format: 'png' | 'jpeg' | 'pdf' | 'print') => {
        if (!url) return;

        try {
            // 1. Fetch SVG kaip tekstą
            const response = await fetch(url);
            const svgText = await response.text();

            // 2. Sukuriam Blob iš SVG
            const blob = new Blob([svgText], { type: 'image/svg+xml' });
            const blobUrl = URL.createObjectURL(blob);

            // 3. Sukuriam Image iš Blob
            const img = new Image();
            img.src = blobUrl;

            img.onload = async () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.drawImage(img, 0, 0);

                if (format === 'print') {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                        printWindow.document.write(`<img src="${canvas.toDataURL('image/png')}" style="width:300px;height:300px;"/>`);
                        printWindow.document.close();
                        printWindow.print();
                    }
                } else if (format === 'pdf') {
                    const pdf = new jsPDF();
                    const dataUrl = canvas.toDataURL('image/png');
                    pdf.addImage(dataUrl, 'PNG', 10, 10, 180, 180);
                    pdf.save('qr-code.pdf');
                } else {
                    const downloadLink = document.createElement('a');
                    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
                    downloadLink.href = canvas.toDataURL(mimeType);
                    downloadLink.download = `qr-code.${format}`;
                    downloadLink.click();
                }
                URL.revokeObjectURL(blobUrl); // išvalom blob'ą
            };

            img.onerror = () => {
                console.error('Nepavyko įkelti SVG paveikslėlio.');
            };
        } catch (error) {
            console.error('Error exporting:', error);
        }

        setAnchorEl(null);
    };


    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box component="span">
                        {type === 'positive' ? 'Positive' : 'Negative'} Response QR Code
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                {url ? (
                    <Box
                        sx={{ width: 256, height: 256, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, bgcolor: 'white', p: 2 }}
                    >
                        <img
                            src={url}
                            alt={`${type} QR Code`}
                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                        />
                    </Box>
                ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <CircularProgress size={40} sx={{ mb: 2 }} />
                        <Typography color="text.secondary">Loading QR code...</Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    color="inherit"
                >
                    Close
                </Button>
                {url && (
                    <>
                        <Button
                            onClick={navigateToQrUrl}
                            variant="contained"
                            color="primary"
                        >
                            View QR Image
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<FileUploadIcon />}
                            onClick={handleExportClick}
                        >
                            Export
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={() => handleExportOption('png')}>Download as PNG</MenuItem>
                            <MenuItem onClick={() => handleExportOption('jpeg')}>Download as JPEG</MenuItem>
                            <MenuItem onClick={() => handleExportOption('pdf')}>Download as PDF</MenuItem>
                            <MenuItem onClick={() => handleExportOption('print')}>Print</MenuItem>
                        </Menu>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default QrViewDialog;
