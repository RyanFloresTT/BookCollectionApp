import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  CircularProgress,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth0 } from '@auth0/auth0-react';
import { stripeService } from '../../services/stripeService';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';

const getTierConfig = (isPremium: boolean) => [
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
    buttonText: isPremium ? 'Downgrade' : 'Current Plan',
    buttonVariant: 'outlined',
    isCurrentPlan: !isPremium,
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
    buttonText: isPremium ? 'Current Plan' : 'Upgrade Now',
    buttonVariant: 'contained',
    isCurrentPlan: isPremium,
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
  const subscriptionStatus = useSubscriptionStatus();
  const isPremium = subscriptionStatus === 'premium';
  const tiers = getTierConfig(isPremium);

  useEffect(() => {
    const status = searchParams.get('payment_status');
    
    if (status === 'cancelled') {
      showSnackbar('Payment cancelled. You can try again when ready.', 'info');
      navigate('?', { replace: true });
    }
  }, [searchParams, showSnackbar, navigate]);

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

  const handleSubscribe = async (tier: string) => {
    if (!isAuthenticated || !user) {
      loginWithRedirect({
        appState: { returnTo: '/subscription' }
      });
      return;
    }

    // If premium user clicking free tier, or free user clicking premium tier
    if ((isPremium && tier === 'Free') || (!isPremium && tier === 'Premium')) {
      if (isPremium) {
        // Handle downgrade through portal
        handleManageSubscription();
      } else {
        // Handle upgrade
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
      }
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

      <Grid2 container spacing={4} display="flex" justifyContent="center">
        {tiers.map((tier) => (
          <Grid2 key={tier.title} size={{ xs: 12, sm: 6, md: 6 }}>
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
                      <ListItemText 
                        primary={feature.name} 
                        sx={{ 
                          '.MuiListItemText-primary': { 
                            color: 'text.primary'
                          } 
                        }} 
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant={tier.buttonVariant as 'outlined' | 'contained'}
                  color="primary"
                  onClick={() => handleSubscribe(tier.title)}
                  disabled={tier.isCurrentPlan || (tier.title === 'Premium' && isLoading)}
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
          </Grid2>
        ))}
      </Grid2>

      {error && (
        <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
    </Container>
  );
};

export default SubscriptionPage; 