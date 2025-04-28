'use client';

import React, { useState, useRef } from 'react';
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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type QrViewDialogProps = {
    open: boolean;
    url: string | null;
    type: 'positive' | 'negative';
    onClose: () => void;
};

const QrViewDialog: React.FC<QrViewDialogProps> = ({ open, url, type, onClose }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const qrRef = useRef<HTMLDivElement>(null); // refas QR kodo eksportui

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
        if (!qrRef.current) return;

        const canvas = await html2canvas(qrRef.current);
        const dataUrl = canvas.toDataURL('image/png');

        if (format === 'print') {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`<img src="${dataUrl}" style="width:300px;height:300px;"/>`);
                printWindow.document.close();
                printWindow.print();
            }
        } else if (format === 'pdf') {
            const pdf = new jsPDF();
            pdf.addImage(dataUrl, 'PNG', 10, 10, 180, 180);
            pdf.save('qr-code.pdf');
        } else {
            const link = document.createElement('a');
            link.href = format === 'jpeg' ? canvas.toDataURL('image/jpeg') : canvas.toDataURL('image/png');
            link.download = `qr-code.${format}`;
            link.click();
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
                        ref={qrRef}
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
