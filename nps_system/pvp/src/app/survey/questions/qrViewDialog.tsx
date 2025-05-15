'use client';

import React, { useState } from 'react';
import {
    Box, Button, Typography, Dialog, DialogActions,
    DialogContent, DialogTitle, IconButton, CircularProgress,
    Menu, MenuItem, Snackbar, Alert
} from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon, Print as PrintIcon } from '@mui/icons-material';

type QrViewDialogProps = {
    open: boolean;
    url: string | null;
    type: 'positive' | 'negative' | 'rating' | 'text';
    onClose: () => void;
};

const QrViewDialog: React.FC<QrViewDialogProps> = ({ open, url, type, onClose }) => {
    const fixedUrl = url?.startsWith('//') ? `https:${url}` : url;
    const proxiedUrl = fixedUrl ? `/api/qr-proxy?url=${encodeURIComponent(fixedUrl)}` : null;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');

    const menuOpen = Boolean(anchorEl);

    const handleDownloadMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const showSnackbar = (msg: string) => {
        setSnackbarMsg(msg);
        setSnackbarOpen(true);
    };

    const downloadImage = async (format: 'png' | 'jpeg') => {
        if (!proxiedUrl) return;
        try {
            const response = await fetch(proxiedUrl);
            const blob = await response.blob();

            const img = new Image();
            const loadImage = new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('Failed to load QR image'));
            });

            img.src = URL.createObjectURL(blob);
            await loadImage;

            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context is null');

            if (format === 'jpeg') {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(img, 0, 0);

            canvas.toBlob((convertedBlob) => {
                if (!convertedBlob) return;
                const link = document.createElement('a');
                link.href = URL.createObjectURL(convertedBlob);
                link.download = `${type}-qr-code.${format}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showSnackbar(`QR Code downloaded as ${format.toUpperCase()}`);
            }, format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download QR code.');
        }
        handleCloseMenu();
    };

    const printQrCode = () => {
        if (!proxiedUrl) return;
        const win = window.open('', '_blank');
        if (!win) return;

        win.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            img { max-width: 90%; max-height: 90%; }
          </style>
        </head>
        <body>
          <img src="${proxiedUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
        win.document.close();
    };

    const navigateToQrUrl = () => {
        if (fixedUrl) window.open(fixedUrl, '_blank');
        onClose();
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{type === 'positive' ? 'Positive' : 'Negative'} Response QR Code</span>
                        <IconButton onClick={onClose}><CloseIcon /></IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    {proxiedUrl ? (
                        <Box
                            component="img"
                            src={proxiedUrl}
                            alt={`${type} QR Code`}
                            sx={{ width: 256, height: 256, objectFit: 'contain' }}
                        />
                    ) : (
                        <Box sx={{ textAlign: 'center' }}>
                            <CircularProgress sx={{ mb: 2 }} />
                            <Typography color="text.secondary">Loading QR code...</Typography>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Button onClick={onClose} variant="outlined" color="inherit">Close</Button>
                    {proxiedUrl && (
                        <>
                            <Button onClick={navigateToQrUrl} variant="outlined">View QR Image</Button>
                            <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={handleDownloadMenu}>
                                Download
                            </Button>
                            <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleCloseMenu}>
                                <MenuItem onClick={() => downloadImage('png')}>Download PNG</MenuItem>
                                <MenuItem onClick={() => downloadImage('jpeg')}>Download JPEG</MenuItem>
                            </Menu>
                            <Button variant="outlined" color="secondary" startIcon={<PrintIcon />} onClick={printQrCode}>
                                Print / Save PDF
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="success" variant="filled">
                    {snackbarMsg}
                </Alert>
            </Snackbar>
        </>
    );
};

export default QrViewDialog;
