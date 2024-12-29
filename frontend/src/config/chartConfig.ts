import { themeColors } from './themeColors';

// Vibrant colors that work well in both light and dark modes
export const chartColors = {
  primary: '#1976d2', // Blue
  secondary: '#9c27b0', // Purple
  success: '#2e7d32', // Green
  warning: '#ed6c02', // Orange
  info: '#0288d1', // Light Blue
  error: '#d32f2f', // Red
};

export const chartBackgroundColors = [
  'rgba(25, 118, 210, 0.7)',   // Blue
  'rgba(156, 39, 176, 0.7)',   // Purple
  'rgba(46, 125, 50, 0.7)',    // Green
  'rgba(237, 108, 2, 0.7)',    // Orange
  'rgba(2, 136, 209, 0.7)',    // Light Blue
  'rgba(211, 47, 47, 0.7)',    // Red
];

export const chartBorderColors = [
  'rgba(25, 118, 210, 1)',     // Blue
  'rgba(156, 39, 176, 1)',     // Purple
  'rgba(46, 125, 50, 1)',      // Green
  'rgba(237, 108, 2, 1)',      // Orange
  'rgba(2, 136, 209, 1)',      // Light Blue
  'rgba(211, 47, 47, 1)',      // Red
];

export const getDefaultChartOptions = (isDarkMode: boolean) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: isDarkMode ? '#fff' : '#000',
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        color: isDarkMode ? '#fff' : '#000',
      },
    },
    y: {
      grid: {
        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        color: isDarkMode ? '#fff' : '#000',
      },
    },
  },
}); 