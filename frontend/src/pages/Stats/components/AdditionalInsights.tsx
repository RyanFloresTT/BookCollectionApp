import React from 'react';
import { Typography, Paper } from '@mui/material';
import Grid2 from '@mui/material/Grid2';

interface AdditionalInsightsProps {
  highestPageCount: number | null;
  lowestPageCount: number | null;
  mostCommonGenre: string;
}

export const AdditionalInsights: React.FC<AdditionalInsightsProps> = ({
  highestPageCount,
  lowestPageCount,
  mostCommonGenre,
}) => {
  return (
    <Grid2 container>
      <Grid2 size={{ xs: 12 }}>
        <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>Additional Insights</Typography>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <Typography variant="body1">Highest Page Count: {highestPageCount}</Typography>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <Typography variant="body1">Lowest Page Count: {lowestPageCount}</Typography>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <Typography variant="body1">Most Common Genre: {mostCommonGenre}</Typography>
            </Grid2>
          </Grid2>
        </Paper>
      </Grid2>
    </Grid2>
  );
}; 