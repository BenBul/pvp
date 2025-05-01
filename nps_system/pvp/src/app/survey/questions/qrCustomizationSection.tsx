import { Box, FormControlLabel, Grid, Input, MenuItem, Paper, Select, Switch, TextField, Typography, CircularProgress } from "@mui/material";
import { 
    Image as LogoIcon
} from "@mui/icons-material";

type QrCustomizationOptions = {
    color: string;
    body: string;
    enableLogo: boolean;
    logo: string;
};

type QrCustomizationSectionProps = {
    options: QrCustomizationOptions;
    setOptions: (options: QrCustomizationOptions) => void;
    type: 'positive' | 'negative';
    previewUrl: string | null;
    isLoading: boolean;
};

const QrCustomizationSection: React.FC<QrCustomizationSectionProps> = ({ 
  options, 
  setOptions, 
  type, 
  previewUrl, 
  isLoading 
}) => (
    <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          {type === 'positive' ? 'Positive' : 'Negative'} Response QR
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2" sx={{ mb: 1 }}>Main Color</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              component="input"
              type="color"
              value={options.color}
              onChange={(e) => setOptions({...options, color: e.target.value})}
              sx={{ width: 40, height: 36, border: '1px solid #ddd', borderRadius: 1, p: 0 }}
            />
            <TextField
              value={options.color}
              onChange={(e) => setOptions({...options, color: e.target.value})}
              size="small"
              fullWidth
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
            />
          </Box>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="body2" sx={{ mb: 1 }}>Body Shape</Typography>
          <Select
            value={options.body}
            onChange={(e) => setOptions({...options, body: e.target.value})}
            size="small"
            fullWidth
            sx={{ height: 36 }}
          >
            <MenuItem value="square">Square</MenuItem>
            <MenuItem value="dot">Dots</MenuItem>
            <MenuItem value="round">Rounded</MenuItem>
          </Select>
        </Grid>
  
        <Grid item xs={12}>
          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={options.enableLogo}
                  onChange={(e) => setOptions({...options, enableLogo: e.target.checked})}
                  color={type === 'positive' ? 'success' : 'error'}
                />
              }
              label="Add Logo to QR Code"
            />
          </Box>
        </Grid>
  
        {options.enableLogo && (
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mb: 1 }}>Logo URL</Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                border: '1px solid #ddd',
                borderRadius: 1,
                px: 1,
                py: 0.5
              }}
            >
              <LogoIcon color="action" fontSize="small" />
              <Input
                fullWidth
                disableUnderline
                placeholder="Enter logo URL"
                value={options.logo}
                onChange={(e) => setOptions({...options, logo: e.target.value})}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              For best results, use a square PNG image with transparent background
            </Typography>
          </Grid>
        )}
      </Grid>
      
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '1px solid #eee', pt: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
          QR Code Preview
        </Typography>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 128, height: 128 }}>
            <CircularProgress 
              size={36} 
              color={type === 'positive' ? 'success' : 'error'} 
            />
          </Box>
        ) : previewUrl ? (
          <Box 
            component="img" 
            src={previewUrl} 
            alt={`${type === 'positive' ? 'Positive' : 'Negative'} QR Preview`} 
            sx={{ width: 128, height: 128, objectFit: 'contain' }}
          />
        ) : (
          <Box 
            sx={{ 
              width: 128, 
              height: 128, 
              border: '1px dashed #ccc',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography variant="caption" color="text.secondary">
              No preview
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );

export default QrCustomizationSection;