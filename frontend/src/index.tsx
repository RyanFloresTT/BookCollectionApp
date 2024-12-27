import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import theme from './theme';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <Auth0Provider
    domain={process.env.REACT_APP_AUTH0_DOMAIN || 'unknown-domain'}
    clientId={process.env.REACT_APP_AUTH0_CLIENT_ID || 'unknown-client-id'}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: "bookcollection.api",
      scope: "openid profile email read:current_user update:current_user_metadata"
    }}
  >
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </React.StrictMode>
  </Auth0Provider>,
);
