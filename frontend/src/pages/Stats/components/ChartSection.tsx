import React from 'react';
import { Paper, Box, useTheme } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { getDefaultChartOptions, chartBackgroundColors, chartBorderColors } from '../../../config/chartConfig';

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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const defaultOptions = getDefaultChartOptions(isDarkMode);

  const barOptions = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      title: {
        display: true,
        text: 'Rating Distribution',
        color: isDarkMode ? '#fff' : '#000',
      },
    },
    scales: {
      ...defaultOptions.scales,
      x: {
        ...defaultOptions.scales.x,
        ticks: {
          ...defaultOptions.scales.x.ticks,
          callback: (value: any) => {
            const rating = value / 2; // Convert to 0-5 scale
            return `${rating}★`;
          },
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: isDarkMode ? '#fff' : '#000',
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Genre Distribution',
        color: isDarkMode ? '#fff' : '#000',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: 20,
      },
    },
  };

  const lineOptions = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      title: {
        display: true,
        text: 'Page Count Distribution',
        color: isDarkMode ? '#fff' : '#000',
      },
    },
    scales: {
      ...defaultOptions.scales,
      y: {
        ...defaultOptions.scales.y,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Pages',
          color: isDarkMode ? '#fff' : '#000',
        },
      },
    },
  };

  // Apply chart colors to the data
  const enhancedChartData = chartData ? {
    ...chartData,
    datasets: chartData.datasets.map((dataset: any, index: number) => ({
      ...dataset,
      backgroundColor: chartBackgroundColors[index % chartBackgroundColors.length],
      borderColor: chartBorderColors[index % chartBorderColors.length],
    })),
  } : null;

  const enhancedPieChartData = pieChartData ? {
    ...pieChartData,
    datasets: pieChartData.datasets.map((dataset: any) => ({
      ...dataset,
      backgroundColor: chartBackgroundColors,
      borderColor: chartBorderColors,
      borderWidth: 1,
    })),
  } : null;

  const enhancedLineChartData = lineChartData ? {
    ...lineChartData,
    datasets: lineChartData.datasets.map((dataset: any, index: number) => ({
      ...dataset,
      backgroundColor: chartBackgroundColors[index % chartBackgroundColors.length],
      borderColor: chartBorderColors[index % chartBorderColors.length],
    })),
  } : null;

  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, md: 6 }}>
        <Paper elevation={3} sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {enhancedChartData && <Bar data={enhancedChartData} options={barOptions} />}
          </Box>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 6 }}>
        <Paper elevation={3} sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {enhancedPieChartData && <Pie data={enhancedPieChartData} options={pieOptions} />}
          </Box>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12 }}>
        <Paper elevation={3} sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {enhancedLineChartData && <Line data={enhancedLineChartData} options={lineOptions} />}
          </Box>
        </Paper>
      </Grid2>
    </Grid2>
  );
}; 