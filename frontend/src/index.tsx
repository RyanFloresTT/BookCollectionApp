import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import theme from './theme';
import { Auth0ProviderWithNavigate } from './auth/Auth0ProviderWithNavigate';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <Auth0ProviderWithNavigate>
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </React.StrictMode>
  </Auth0ProviderWithNavigate>,
);
