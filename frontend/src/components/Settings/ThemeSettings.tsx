import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';

interface ThemeSettingsProps {
  isPremium: boolean;
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({ isPremium }) => {
  const navigate = useNavigate();

  if (!isPremium) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <LockIcon sx={{ fontSize: 40, color: 'grey.500', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Premium Feature
        </Typography>
        <Typography variant="body1" paragraph>
          Customize your reading experience with custom themes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/subscription')}
        >
          Upgrade to Premium
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Theme Customization
      </Typography>
      {/* Add theme customization options here */}
    </Box>
  );
}; 