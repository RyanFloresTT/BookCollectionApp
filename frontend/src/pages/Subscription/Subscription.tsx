import React from 'react';
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
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth0 } from '@auth0/auth0-react';

const tiers = [
  {
    title: 'Free',
    price: '0',
    description: 'Basic features for personal use',
    features: [
      { name: 'Basic book collection management', included: true },
      { name: 'Basic statistics', included: true },
      { name: 'Cover image support', included: true },
      { name: 'Reading progress tracking', included: false },
      { name: 'Advanced analytics', included: false },
      { name: 'Reading goals and streaks', included: false },
      { name: 'Priority support', included: false },
    ],
    buttonText: 'Current Plan',
    buttonVariant: 'outlined',
  },
  {
    title: 'Premium',
    price: '4.99',
    description: 'Advanced features for serious readers',
    features: [
      { name: 'Basic book collection management', included: true },
      { name: 'Basic statistics', included: true },
      { name: 'Cover image support', included: true },
      { name: 'Reading progress tracking', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Reading goals and streaks', included: true },
      { name: 'Priority support', included: true },
    ],
    buttonText: 'Upgrade Now',
    buttonVariant: 'contained',
  },
];

const SubscriptionPage: React.FC = () => {
  const theme = useTheme();
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();

  const handleSubscribe = async (tier: string) => {
    if (tier === 'Free') {
      return;
    }

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      loginWithRedirect({
        appState: { returnTo: '/subscription' }
      });
      return;
    }

    // Redirect to Stripe checkout
    window.location.href = 'https://buy.stripe.com/test_aEUeYQ5V514s9sk3cd';
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
                  sx={{ mt: 2 }}
                >
                  {tier.buttonText}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SubscriptionPage; 