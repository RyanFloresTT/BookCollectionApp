import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface SubscriptionSettingsProps {
  status: string;
}

export const SubscriptionSettings: React.FC<SubscriptionSettingsProps> = ({ status }) => {
  const navigate = useNavigate();

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
              // Add manage subscription logic
            >
              Manage Subscription
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
              onClick={() => navigate('/subscription')}
            >
              Upgrade Now
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}; 