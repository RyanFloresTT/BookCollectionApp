import React from 'react';
import { Typography, Paper } from '@mui/material';
import Grid2 from '@mui/material/Grid2';

interface KeyStatisticsProps {
  totalBooks: number;
  averageRating: number | null;
  totalPages: number;
}

export const KeyStatistics: React.FC<KeyStatisticsProps> = ({
  totalBooks,
  averageRating,
  totalPages,
}) => {
  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, md: 4 }}>
        <Paper elevation={3} sx={{ p: 3, height: '100%', backgroundColor: 'primary.light', color: 'white' }}>
          <Typography variant="h6" gutterBottom>Total Books</Typography>
          <Typography variant="h3">{totalBooks}</Typography>
        </Paper>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 4 }}>
        <Paper elevation={3} sx={{ p: 3, height: '100%', backgroundColor: 'secondary.light', color: 'white' }}>
          <Typography variant="h6" gutterBottom>Average Rating</Typography>
          <Typography variant="h3">{averageRating?.toFixed(1) || '0'}</Typography>
        </Paper>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 4 }}>
        <Paper elevation={3} sx={{ p: 3, height: '100%', backgroundColor: 'success.light', color: 'white' }}>
          <Typography variant="h6" gutterBottom>Total Pages</Typography>
          <Typography variant="h3">{totalPages.toLocaleString()}</Typography>
        </Paper>
      </Grid2>
    </Grid2>
  );
}; 