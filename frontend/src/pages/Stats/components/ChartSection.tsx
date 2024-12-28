import React from 'react';
import { Typography, Paper, Box } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { Bar, Line, Pie } from 'react-chartjs-2';

interface ChartSectionProps {
  chartData: any;
  pieChartData: any;
  lineChartData: any;
}

export const ChartSection: React.FC<ChartSectionProps> = ({
  chartData,
  pieChartData,
  lineChartData,
}) => {
  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, md: 6 }}>
        <Paper elevation={3} sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>Rating Distribution</Typography>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {chartData && <Bar data={chartData} options={{ 
              maintainAspectRatio: false,
              responsive: true
            }} />}
          </Box>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 6 }}>
        <Paper elevation={3} sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>Genre Distribution</Typography>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {pieChartData && <Pie data={pieChartData} options={{ 
              maintainAspectRatio: false,
              responsive: true
            }} />}
          </Box>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12 }}>
        <Paper elevation={3} sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>Page Count Distribution</Typography>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {lineChartData && <Line data={lineChartData} options={{ 
              maintainAspectRatio: false,
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Pages'
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