import React from 'react';
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
  url: string | null;        // SVG preview URL (gautas per POST)
  qrData: string;            // Tikras QR turinys (URL, tekstas ir pan.)
  color: string;             // Spalva
  logo?: string;             // Logotipo URL (jei yra)
  body?: string;             // QR formos tipas (pvz. "square")
  type: 'positive' | 'negative';
  onClose: () => void;
};

const QrViewDialog: React.FC<QrViewDialogProps> = ({
                                                     open,
                                                     url,
                                                     qrData,
                                                     color,
                                                     logo,
                                                     body,
                                                     type,
                                                     onClose
                                                   }) => {
  const navigateToQrUrl = () => {
    if (url) {
      window.open(url, '_blank');
    }
    onClose();
  };

  const downloadSvg = () => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qr-code.svg';
    link.click();
  };

  const downloadPng = () => {
    if (!qrData) return;

    const config = {
      body: body || "square",
      eye: "frame0",
      eyeBall: "ball0",
      bodyColor: color || "#000000",
      bgColor: "#FFFFFF",
      eye1Color: color || "#000000",
      eye2Color: color || "#000000",
      eye3Color: color || "#000000",
      eyeBall1Color: color || "#000000",
      eyeBall2Color: color || "#000000",
      eyeBall3Color: color || "#000000",
      logo: logo || "",
      logoMode: logo ? "default" : ""
    };

    const encodedData = encodeURIComponent(qrData);
    const encodedConfig = encodeURIComponent(JSON.stringify(config));

    const pngUrl = `https://api.qrcode-monkey.com/qr/custom?data=${encodedData}&config=${encodedConfig}&size=1000&file=png&download=true`;

    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = 'qr-code.png';
    link.click();
  };

  const printImage = () => {
    if (!url) return;

    const win = window.open('');
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            img { max-width: 100%; max-height: 100%; }
          </style>
        </head>
        <body>
          <img src="${url}" onload="window.print(); window.close()" />
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
                  component="img"
                  src={url}
                  alt={`${type} QR Code`}
                  sx={{ width: 256, height: 256, objectFit: 'contain', mb: 2 }}
              />
          ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography color="text.secondary">Loading QR code...</Typography>
              </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ flexWrap: 'wrap', justifyContent: 'space-between', p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button onClick={onClose} variant="outlined" color="inherit">
              Close
            </Button>
            {url && (
                <>
                  <Button onClick={navigateToQrUrl} variant="contained" color="primary">
                    View QR Image
                  </Button>
                  <Button onClick={downloadSvg} variant="outlined">
                    Download SVG
                  </Button>
                  <Button onClick={downloadPng} variant="outlined">
                    Download PNG
                  </Button>
                  <Button onClick={printImage} variant="outlined">
                    Print / Save as PDF
                  </Button>
                </>
            )}
          </Box>
        </DialogActions>
      </Dialog>
  );
};

export default QrViewDialog;
