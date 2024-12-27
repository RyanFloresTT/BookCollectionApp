import React from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../../services/api';

const premiumFeatures = [
  {
    title: 'Yearly Reading Wrapped',
    description: 'Get a beautiful yearly summary of your reading habits, like Spotify Wrapped',
  },
  {
    title: 'Advanced Analytics',
    description: 'Deep dive into your reading patterns with detailed charts and insights',
  },
  {
    title: 'Reading Goals & Predictions',
    description: 'Set and track reading goals with AI-powered predictions',
  },
  {
    title: 'Collection Insights',
    description: 'Discover patterns in your book collection with advanced genre and author analysis',
  },
  {
    title: 'Custom Tags & Advanced Filtering',
    description: 'Organize your collection with custom tags and powerful filtering options',
  },
  {
    title: 'Reading Schedule Planner',
    description: 'Plan your reading schedule and get estimated completion times',
  },
];

const SubscriptionPage: React.FC = () => {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();

  const handleSubscribe = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await api.post(
        '/subscription/create-checkout',
        {
          userId: user?.sub,
          userEmail: user?.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md">
        <Box py={8} textAlign="center">
          <Typography variant="h4" gutterBottom>
            Please log in to view subscription options
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={8}>
        <Typography variant="h3" align="center" gutterBottom>
          Upgrade to Premium
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" paragraph>
          Unlock advanced features and get deeper insights into your reading journey
        </Typography>

        <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom>
                Premium Plan
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                $9.99/month
              </Typography>
              <List>
                {premiumFeatures.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={feature.title}
                      secondary={feature.description}
                    />
                  </ListItem>
                ))}
              </List>
              <Box mt={4} textAlign="center">
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleSubscribe}
                >
                  Subscribe Now
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SubscriptionPage; 