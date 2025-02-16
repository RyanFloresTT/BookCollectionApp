import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ButtonAppBar from './components/AppBar/ButtonAppBar';
import Home from './pages/Home/Home';
import { Stats } from './pages/Stats/Stats';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Collection from './pages/Collection/Collection';
import SubscriptionPage from './pages/Subscription/Subscription';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { setAuthToken } from './services/api';
import { ThemeProvider } from './context/ThemeContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { useSubscriptionStatus } from './hooks/useSubscriptionStatus';
import { Box, CssBaseline } from '@mui/material';

const domain = process.env.REACT_APP_AUTH0_DOMAIN || '';
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || '';
const audience = process.env.REACT_APP_AUTH0_AUDIENCE || '';
const redirectUri = process.env.REACT_APP_AUTH0_CALLBACK_URL || 'undefined callback url';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Create an AuthSetup component to handle auth token setup
const AuthSetup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const subscriptionStatus = useSubscriptionStatus();
  const isPremium = subscriptionStatus.isPremium;

  useEffect(() => {
    setAuthToken(async () => {
      try {
        const token = await getAccessTokenSilently();
        return token;
      } catch (error) {
        console.error('AuthSetup - Error getting token:', error);
        throw error;
      }
    });
  }, [getAccessTokenSilently, isAuthenticated]);

  return (
    <ThemeProvider isPremium={isPremium}>
      <CssBaseline />
      <SnackbarProvider>
        <Box sx={{ 
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary'
        }}>
          {children}
        </Box>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthSetup>
          <Router>
            <ButtonAppBar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/collection" 
                element={
                <ProtectedRoute>
                  <Collection />
                </ProtectedRoute>
              } />
              <Route 
                path="/stats" 
                element={
                <ProtectedRoute>
                  <Stats />
                </ProtectedRoute>
              } />
              <Route 
                path="/subscription" 
                element={
                  <SubscriptionPage />
                } />
            </Routes>
          </Router>
        </AuthSetup>
      </QueryClientProvider>
    </Auth0Provider>
  );
};

export default App;
