import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Customize primary color
    },
    secondary: {
      main: '#dc004e', // Customize secondary color
    },
    background: {
      default: '#f5f5f5', // Light grey background
    },
  },
  typography: {
    h3: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 400,
    },
  },
});

export default theme;
