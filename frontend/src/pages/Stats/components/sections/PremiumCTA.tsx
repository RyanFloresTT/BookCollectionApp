import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';

export const PremiumCTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Paper elevation={2} sx={{ p: 4, mb: 4, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom color="primary">
        🌟 Unlock Advanced Reading Insights
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Upgrade to Premium to access detailed statistics, reading patterns, and personalized insights.
      </Typography>
      <Grid2 container spacing={3} justifyContent="center">
        <Grid2>
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/subscription')}
            >
              Upgrade to Premium
            </Button>
          </Box>
        </Grid2>
      </Grid2>
    </Paper>
  );
}; 