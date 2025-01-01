import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { stripeService } from '../../services/stripeService';
import { useSnackbar } from '../../hooks/useSnackbar';

interface SubscriptionSettingsProps {
  status: {
    isPremium: boolean;
    loading: boolean;
    error: string | null;
  };
  onClose: () => void;
}

export const SubscriptionSettings: React.FC<SubscriptionSettingsProps> = ({ status, onClose }) => {
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgradeClick = () => {
    onClose();
    navigate('/subscription');
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const { url } = await stripeService.createCustomerPortalSession(token);
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      showSnackbar('Failed to open subscription management. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (status.loading) {
    return <CircularProgress />;
  }

  if (status.error) {
    return <Typography color="error">Error loading subscription status</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Current Plan: {status.isPremium ? 'Premium' : 'Free'}
      </Typography>
      {status.isPremium && (
        <Button
          variant="contained"
          onClick={handleManageSubscription}
          sx={{ mt: 2 }}
        >
          Manage Subscription
        </Button>
      )}
    </Box>
  );
}; 