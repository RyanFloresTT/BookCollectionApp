import React from 'react';
import { Typography, Paper, Button, Box } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

interface PremiumStatsProps {
  isPremium: boolean;
  averageReadingTime: number | null;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  monthlyStats: any;
}

export const PremiumStats: React.FC<PremiumStatsProps> = ({
  isPremium,
  averageReadingTime,
  currentStreak,
  longestStreak,
  completionRate,
  monthlyStats,
}) => {
  const navigate = useNavigate();

  if (!isPremium) {
    return (
      <Grid2 container>
        <Grid2 size={{ xs: 12 }}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Upgrade to Premium
            </Typography>
            <Typography variant="body1" paragraph>
              Get access to advanced statistics and reading insights
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/subscription')}
            >
              Upgrade Now
            </Button>
          </Paper>
        </Grid2>
      </Grid2>
    );
  }

  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12 }}>
        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Premium Insights
        </Typography>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 3 }}>
        <Paper elevation={3} sx={{ p: 3, height: '100%', backgroundColor: 'info.light', color: 'white' }}>
          <Typography variant="h6" gutterBottom>Average Reading Time</Typography>
          <Typography variant="h3">{averageReadingTime || 0} days</Typography>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 3 }}>
        <Paper elevation={3} sx={{ p: 3, height: '100%', backgroundColor: 'warning.light', color: 'white' }}>
          <Typography variant="h6" gutterBottom>Current Streak</Typography>
          <Typography variant="h3">{currentStreak} days</Typography>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 3 }}>
        <Paper elevation={3} sx={{ p: 3, height: '100%', backgroundColor: 'error.light', color: 'white' }}>
          <Typography variant="h6" gutterBottom>Longest Streak</Typography>
          <Typography variant="h3">{longestStreak} days</Typography>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 3 }}>
        <Paper elevation={3} sx={{ p: 3, height: '100%', backgroundColor: 'success.light', color: 'white' }}>
          <Typography variant="h6" gutterBottom>Completion Rate</Typography>
          <Typography variant="h3">{completionRate.toFixed(1)}%</Typography>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12 }}>
        <Paper elevation={3} sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>Monthly Reading Activity</Typography>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {monthlyStats && <Bar data={monthlyStats} options={{ 
              maintainAspectRatio: false,
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Books Completed'
                  }
                }
              }
            }} />}
          </Box>
        </Paper>
      </Grid2>
    </Grid2>
  );
}; 