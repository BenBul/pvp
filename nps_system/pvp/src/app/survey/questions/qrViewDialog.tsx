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
  url: string | null;
  type: 'positive' | 'negative';
  onClose: () => void;
};

const QrViewDialog:React.FC<QrViewDialogProps> = ({ open, url, type, onClose }) => {
  const navigateToQrUrl = () => {
    if (url) {
      window.open(url, '_blank');
    }
    onClose();
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
      
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
        >
          Close
        </Button>
        {url && (
          <Button
            onClick={navigateToQrUrl}
            variant="contained"
            color="primary"
          >
            View QR Image
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QrViewDialog;