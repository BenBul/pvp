// src/app/survey/questions/QrViewDialog.tsx
import React, { useRef } from 'react';
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

type QrViewDialogProps = {
    open: boolean;
    url: string | null;
    type: 'positive' | 'negative';
    onClose: () => void;
};

const QrViewDialog: React.FC<QrViewDialogProps> = ({ open, url, type, onClose }) => {
    const qrImageRef = useRef<HTMLImageElement | null>(null);

    const proxiedUrl = url ? `/api/qr-proxy?url=${encodeURIComponent(url)}` : null;

    const downloadQrCode = () => {
        if (!proxiedUrl || !qrImageRef.current) return;

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context error');

            const img = qrImageRef.current;
            canvas.width = img.naturalWidth || 300;
            canvas.height = img.naturalHeight || 300;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const dataUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${type}-qr-code.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading QR code:', error);
            alert('Failed to download QR code. Please try a screenshot instead.');
        }
    };

    const printQrCode = () => {
        if (!proxiedUrl || !qrImageRef.current) return;

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context error');

            const img = qrImageRef.current;
            canvas.width = img.naturalWidth || 300;
            canvas.height = img.naturalHeight || 300;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const dataUrl = canvas.toDataURL('image/png');
            const printWindow = window.open('', '_blank');
            if (!printWindow) throw new Error('Print window error');

            printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: Arial; }
              h2 { margin-bottom: 20px; }
              img { max-width: 80%; max-height: 70vh; margin-bottom: 20px; }
              @media print { @page { size: auto; margin: 1cm; } .no-print { display: none !important; } }
            </style>
          </head>
          <body>
            <h2>${type === 'positive' ? 'Positive' : 'Negative'} Response QR Code</h2>
            <img src="${dataUrl}" alt="QR Code">
            <div class="no-print" style="margin-top: 20px;">
              <button onclick="window.print();">Print</button>
              <button onclick="window.close();">Close</button>
            </div>
          </body>
        </html>
      `);

            printWindow.document.close();
        } catch (error) {
            console.error('Print error:', error);
            alert('Failed to print QR code.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box component="span">{type === 'positive' ? 'Positive' : 'Negative'} Response QR Code</Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                {proxiedUrl ? (
                    <Box
                        component="img"
                        src={proxiedUrl}
                        alt={`${type} QR Code`}
                        ref={qrImageRef}
                        sx={{ width: 256, height: 256, objectFit: 'contain', mb: 2 }}
                    />
                ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <CircularProgress size={40} sx={{ mb: 2 }} />
                        <Typography color="text.secondary">Loading QR code...</Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined" color="inherit">Close</Button>
                {url && (
                    <>
                        <Button onClick={downloadQrCode} variant="contained" color="primary">Download</Button>
                        <Button onClick={printQrCode} variant="contained" color="secondary">Print</Button>
                        <Button onClick={() => window.open(url, '_blank')} variant="outlined">View Image</Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default QrViewDialog;
