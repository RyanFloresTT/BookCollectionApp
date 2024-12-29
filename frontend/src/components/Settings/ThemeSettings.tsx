import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  Divider,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import PaletteIcon from '@mui/icons-material/Palette';
import { useNavigate } from 'react-router-dom';
import { ThemeMode, ColorOption } from '../../context/ThemeContext';

interface ThemeSettingsProps {
  isPremium: boolean;
  onClose: () => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  currentColor: ColorOption;
  onColorChange: (color: ColorOption) => void;
}

const colorOptions = [
  { value: 'blue' as ColorOption, label: 'Blue', color: '#1976d2' },
  { value: 'green' as ColorOption, label: 'Green', color: '#2e7d32' },
  { value: 'purple' as ColorOption, label: 'Purple', color: '#7b1fa2' },
  { value: 'red' as ColorOption, label: 'Red', color: '#d32f2f' },
];

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({
  isPremium,
  onClose,
  currentTheme,
  onThemeChange,
  currentColor,
  onColorChange,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleUpgradeClick = () => {
    onClose();
    navigate('/subscription');
  };

  if (!isPremium) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Theme Mode</Typography>
          <ToggleButtonGroup
            value={currentTheme}
            exclusive
            onChange={(_, value) => value && onThemeChange(value)}
            aria-label="theme selection"
          >
            <ToggleButton value="light" aria-label="light theme">
              <LightModeIcon sx={{ mr: 1 }} />
              Light
            </ToggleButton>
            <ToggleButton value="dark" aria-label="dark theme">
              <DarkModeIcon sx={{ mr: 1 }} />
              Dark
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <LockIcon sx={{ fontSize: 40, color: 'grey.500', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Premium Theme Features
          </Typography>
          <Typography variant="body1" paragraph>
            Unlock additional theme colors:
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2, justifyContent: 'center' }}>
            <Grid item xs={12} sm={6}>
              <Typography>🎨 Blue Theme</Typography>
              <Typography>🌿 Green Theme</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>💜 Purple Theme</Typography>
              <Typography>❤️ Red Theme</Typography>
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpgradeClick}
            startIcon={<PaletteIcon />}
          >
            Upgrade to Premium
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Theme Settings</Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>Mode</Typography>
        <ToggleButtonGroup
          value={currentTheme}
          exclusive
          onChange={(_, value) => value && onThemeChange(value)}
          aria-label="theme mode"
          sx={{ mb: 3 }}
        >
          <ToggleButton value="light" aria-label="light mode">
            <LightModeIcon sx={{ mr: 1 }} />
            Light
          </ToggleButton>
          <ToggleButton value="dark" aria-label="dark mode">
            <DarkModeIcon sx={{ mr: 1 }} />
            Dark
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" gutterBottom>Color</Typography>
        <Grid container spacing={2}>
          {colorOptions.map((option) => (
            <Grid item xs={6} sm={3} key={option.value}>
              <Button
                fullWidth
                variant={currentColor === option.value ? 'contained' : 'outlined'}
                onClick={() => onColorChange(option.value)}
                sx={{
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  bgcolor: option.color,
                  color: 'white',
                  '&:hover': {
                    bgcolor: `${option.color}dd`,
                  },
                  ...(currentColor === option.value && {
                    border: 3,
                    borderColor: theme.palette.mode === 'dark' ? 'white' : 'black',
                  })
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: option.color,
                    border: 2,
                    borderColor: 'white',
                  }}
                />
                {option.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onClose}
          sx={{ ml: 2 }}
        >
          Apply Theme
        </Button>
      </Box>
    </Paper>
  );
}; 