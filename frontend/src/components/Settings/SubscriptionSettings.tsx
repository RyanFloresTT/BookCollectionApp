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
  status: string;
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

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Subscription Status
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body1">
            Current Plan:
          </Typography>
          <Chip
            label={status === 'premium' ? 'Premium' : 'Free'}
            color={status === 'premium' ? 'secondary' : 'default'}
          />
        </Box>
        {status === 'premium' ? (
          <>
            <Typography variant="body2" color="text.secondary" paragraph>
              You're enjoying all premium features!
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleManageSubscription}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Loading...' : 'Manage Subscription'}
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upgrade to premium to unlock all features
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpgradeClick}
            >
              Upgrade Now
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}; 