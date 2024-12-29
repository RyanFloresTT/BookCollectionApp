import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  CircularProgress,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth0 } from '@auth0/auth0-react';
import { stripeService } from '../../services/stripeService';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useNavigate, useSearchParams } from 'react-router-dom';

const tiers = [
  {
    title: 'Free',
    price: '0',
    description: 'Perfect for casual readers',
    features: [
      { name: 'Unlimited book entries', included: true },
      { name: 'Basic statistics', included: true },
      { name: 'Search and filter', included: true },
      { name: 'Reading progress tracking', included: true },
      { name: 'Advanced reading analytics', included: false },
      { name: 'Reading speed tracking', included: false },
      { name: 'Genre insights', included: false },
      { name: 'Reading streaks', included: false },
      { name: 'Monthly progress reports', included: false },
      { name: 'Data export (CSV, JSON)', included: false },
    ],
    buttonText: 'Current Plan',
    buttonVariant: 'outlined',
  },
  {
    title: 'Premium',
    price: '4.99',
    description: 'For dedicated book enthusiasts',
    features: [
      { name: 'Unlimited book entries', included: true },
      { name: 'Basic statistics', included: true },
      { name: 'Search and filter', included: true },
      { name: 'Reading progress tracking', included: true },
      { name: 'Advanced reading analytics', included: true },
      { name: 'Reading speed tracking', included: true },
      { name: 'Genre insights', included: true },
      { name: 'Reading streaks', included: true },
      { name: 'Monthly progress reports', included: true },
      { name: 'Data export (CSV, JSON)', included: true },
    ],
    buttonText: 'Upgrade Now',
    buttonVariant: 'contained',
  },
];

const SubscriptionPage: React.FC = () => {
  const theme = useTheme();
  const { isAuthenticated, loginWithRedirect, user, getAccessTokenSilently } = useAuth0();
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('payment_status');
    
    if (status === 'cancelled') {
      showSnackbar('Payment cancelled. You can try again when ready.', 'info');
      navigate('?', { replace: true });
    }
  }, [searchParams, showSnackbar, navigate]);

  const handleSubscribe = async (tier: string) => {
    if (tier === 'Free') return;

    if (!isAuthenticated || !user) {
      loginWithRedirect({
        appState: { returnTo: '/subscription' }
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getAccessTokenSilently();
      const { url } = await stripeService.createCheckoutSession(
        user.sub as string,
        user.email as string,
        token
      );
      window.location.href = url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      showSnackbar('Failed to initiate checkout. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" color="text.primary" gutterBottom>
          Subscription Plans
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Choose the perfect plan for your reading journey
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {tiers.map((tier) => (
          <Grid item key={tier.title} xs={12} sm={6} md={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                ...(tier.title === 'Premium' && {
                  border: `2px solid ${theme.palette.primary.main}`,
                }),
              }}
            >
              <CardHeader
                title={tier.title}
                titleTypographyProps={{ align: 'center', variant: 'h4' }}
                sx={{
                  backgroundColor: tier.title === 'Premium' ? 'primary.main' : 'grey.200',
                  color: tier.title === 'Premium' ? 'common.white' : 'text.primary',
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography component="h2" variant="h3" color="text.primary">
                    ${tier.price}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    /month
                  </Typography>
                </Box>
                <Typography
                  variant="subtitle1"
                  align="center"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {tier.description}
                </Typography>
                <List>
                  {tier.features.map((feature) => (
                    <ListItem key={feature.name} sx={{ py: 1 }}>
                      <ListItemIcon>
                        {feature.included ? (
                          <CheckIcon sx={{ color: 'success.main' }} />
                        ) : (
                          <CloseIcon sx={{ color: 'error.main' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={feature.name} />
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant={tier.buttonVariant as 'outlined' | 'contained'}
                  color="primary"
                  onClick={() => handleSubscribe(tier.title)}
                  disabled={tier.title === 'Premium' && isLoading}
                  sx={{ mt: 2 }}
                >
                  {tier.title === 'Premium' && isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    tier.buttonText
                  )}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {error && (
        <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
    </Container>
  );
};

export default SubscriptionPage; 