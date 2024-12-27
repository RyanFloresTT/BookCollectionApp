import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { useSearchParams } from 'react-router-dom';

interface Subscription {
  id: string;
  status: string;
  current_period_end: string;
}

const Settings: React.FC = () => {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/subscription/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        setError('Failed to fetch subscription status');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchSubscription();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  const handleManageSubscription = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/subscription/portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError('Failed to open subscription portal');
      console.error(err);
    }
  };

  const handleUpgrade = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/subscription/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?.sub,
          userEmail: user?.email,
        }),
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError('Failed to start upgrade process');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {searchParams.get('subscription') === 'success' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your subscription has been updated successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Subscription
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Current Plan: <strong>{subscription?.status === 'active' ? 'Premium' : 'Free'}</strong>
            </Typography>
            
            {subscription?.status === 'active' && (
              <>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleManageSubscription}
                  sx={{ mt: 2 }}
                >
                  Manage Subscription
                </Button>
              </>
            )}
            
            {(!subscription || subscription.status !== 'active') && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpgrade}
                sx={{ mt: 2 }}
              >
                Upgrade to Premium
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings; 