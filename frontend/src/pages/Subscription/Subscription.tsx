import React from 'react';
import { Container, Box, Typography, Paper, Button } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth0 } from '@auth0/auth0-react';
import { stripeService } from '../../services/stripeService';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';
import {
  KeyStatsFeature,
  ReadingPatternsFeature,
  GenreInsightsFeature,
  BookStatsFeature,
  MonthlyProgressFeature,
  ReadingGoalFeature,
} from '../../components/PremiumFeatures/PremiumFeatures';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import MenuBook from '@mui/icons-material/MenuBook';
import Category from '@mui/icons-material/Category';
import AutoStories from '@mui/icons-material/AutoStories';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LinearProgress from '@mui/material/LinearProgress';
import { Pie, Bar } from 'react-chartjs-2';

const PricingCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const Subscription: React.FC = () => {
  const { isAuthenticated, loginWithRedirect, user, getAccessTokenSilently } = useAuth0();
  const subscriptionStatus = useSubscriptionStatus();
  const isPremium = subscriptionStatus.isPremium;

  const handleSubscribe = async (tier: 'Free' | 'Premium') => {
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
        }
      }
    }
  };

  const handleManageSubscription = async () => {
    try {
      const token = await getAccessTokenSilently();
      const { url } = await stripeService.createCustomerPortalSession(token);
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary">
            Upgrade to Premium
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Unlock advanced features and get deeper insights into your reading journey
          </Typography>
        </Box>

        {/* Pricing Section */}
        <Grid2 container spacing={4} sx={{ mb: 8 }}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <PricingCard elevation={2}>
              <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                Free
              </Typography>
              <Typography variant="h3" gutterBottom>
                $0
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Perfect for casual readers
              </Typography>
              <Box sx={{ width: '100%', mb: 4 }}>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="primary" fontSize="small" /> Unlimited book entries
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="primary" fontSize="small" /> Basic reading statistics
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="primary" fontSize="small" /> Search and filter books
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="primary" fontSize="small" /> Reading progress tracking
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                color="primary" 
                size="large" 
                sx={{ mt: 'auto' }}
                onClick={() => handleSubscribe('Free')}
                disabled={!isPremium}
              >
                {isPremium ? 'Downgrade' : 'Current Plan'}
              </Button>
            </PricingCard>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <PricingCard elevation={3} sx={{ borderColor: 'primary.main', borderWidth: 2, borderStyle: 'solid' }}>
              <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                Premium
              </Typography>
              <Typography variant="h3" gutterBottom>
                $4.99
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>per month</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                For dedicated book enthusiasts
              </Typography>
              <Box sx={{ width: '100%', mb: 4 }}>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="primary" fontSize="small" /> Everything in Free
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="primary" fontSize="small" /> Advanced reading analytics
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="primary" fontSize="small" /> Reading speed tracking
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="primary" fontSize="small" /> Detailed genre insights
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="primary" fontSize="small" /> Reading streaks & achievements
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="primary" fontSize="small" /> Monthly progress reports
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="primary" fontSize="small" /> Import/Export functionality
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="primary" fontSize="small" /> Annual Reading Wrapped
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                color="primary" 
                size="large" 
                onClick={() => handleSubscribe('Premium')}
                disabled={isPremium}
                sx={{ mt: 'auto' }}
              >
                {isPremium ? 'Current Plan' : 'Upgrade Now'}
              </Button>
            </PricingCard>
          </Grid2>
        </Grid2>

        {/* Feature Previews */}
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 6 }}>
          Premium Features in Action
        </Typography>

        {/* Feature Cards */}
        <Grid2 container spacing={4}>
          <Grid2 size={{ xs: 12 }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AutoGraphIcon color="primary" />
                <Typography variant="h6" color="primary" sx={{ ml: 1 }}>
                  Key Statistics
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ maxWidth: '800px', mb: 3 }}>
                Track your reading progress with detailed metrics including reading speed, completion rates, and streaks.
              </Typography>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, sm: 4 }}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 3, 
                      background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
                      color: 'white'
                    }}
                  >
                    <Typography variant="h6" gutterBottom>Current Streak</Typography>
                    <Typography variant="h3">12</Typography>
                    <Typography>days reading</Typography>
                  </Paper>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 4 }}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 3, 
                      background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                      color: 'white'
                    }}
                  >
                    <Typography variant="h6" gutterBottom>Reading Speed</Typography>
                    <Typography variant="h3">42</Typography>
                    <Typography>pages per day</Typography>
                  </Paper>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 4 }}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 3, 
                      background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
                      color: 'white'
                    }}
                  >
                    <Typography variant="h6" gutterBottom>Completion Rate</Typography>
                    <Typography variant="h3">85%</Typography>
                    <Typography>of started books</Typography>
                  </Paper>
                </Grid2>
              </Grid2>
            </Paper>
          </Grid2>

          <Grid2 size={{ xs: 12 }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MenuBook color="primary" />
                <Typography variant="h6" color="primary" sx={{ ml: 1 }}>
                  Reading Patterns
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ maxWidth: '800px', mb: 3 }}>
                Discover your reading habits, peak seasons, and reading sprint achievements.
              </Typography>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">Peak Season</Typography>
                    <Typography variant="h4">Summer</Typography>
                    <Typography variant="body2" color="text.secondary">15 books</Typography>
                  </Paper>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">Reading Velocity</Typography>
                    <Typography variant="h4">3.5</Typography>
                    <Typography variant="body2" color="text.secondary">books per month</Typography>
                  </Paper>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">Best Sprint</Typography>
                    <Typography variant="h4">5</Typography>
                    <Typography variant="body2" color="text.secondary">books in 14 days</Typography>
                  </Paper>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">Preferred Days</Typography>
                    <Typography variant="h4">Weekends</Typography>
                    <Typography variant="body2" color="text.secondary">most completions</Typography>
                  </Paper>
                </Grid2>
              </Grid2>
            </Paper>
          </Grid2>

          <Grid2 size={{ xs: 12 }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Category color="primary" />
                <Typography variant="h6" color="primary" sx={{ ml: 1 }}>
                  Genre Insights
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ maxWidth: '800px', mb: 3 }}>
                Analyze your reading preferences and discover patterns across different genres.
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <Pie
                  data={{
                    labels: ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography'],
                    datasets: [{
                      data: [35, 25, 20, 15, 5],
                      backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                      ],
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          boxWidth: 12,
                          font: { size: 11 }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid2>

          <Grid2 size={{ xs: 12 }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AutoStories color="primary" />
                <Typography variant="h6" color="primary" sx={{ ml: 1 }}>
                  Book Stats
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ maxWidth: '800px', mb: 3 }}>
                Get detailed insights about your reading preferences and book completion patterns.
              </Typography>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">Average Pages</Typography>
                    <Typography variant="h4">324</Typography>
                    <Typography variant="body2" color="text.secondary">per book</Typography>
                  </Paper>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">Longest Book</Typography>
                    <Typography variant="h4">742</Typography>
                    <Typography variant="body2" color="text.secondary">The Way of Kings</Typography>
                  </Paper>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">Shortest Book</Typography>
                    <Typography variant="h4">124</Typography>
                    <Typography variant="body2" color="text.secondary">The Old Man and the Sea</Typography>
                  </Paper>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">Average Time</Typography>
                    <Typography variant="h4">12</Typography>
                    <Typography variant="body2" color="text.secondary">days to complete</Typography>
                  </Paper>
                </Grid2>
              </Grid2>
            </Paper>
          </Grid2>
        </Grid2>

        {/* Monthly Progress */}
        <Box sx={{ mt: 4 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmojiEventsIcon color="primary" />
              <Typography variant="h6" color="primary" sx={{ ml: 1 }}>
                Monthly Progress
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, maxWidth: '800px' }}>
              Track your reading progress over time.
            </Typography>
            <Box sx={{ height: 300, width: '100%' }}>
              <Bar
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                  datasets: [
                    {
                      label: 'Books Started',
                      data: [4, 3, 5, 4, 3, 2],
                      backgroundColor: 'rgba(255, 159, 64, 0.7)',
                      borderColor: 'rgba(255, 159, 64, 1)',
                      borderWidth: 1
                    },
                    {
                      label: 'Books Finished',
                      data: [3, 4, 3, 5, 2, 3],
                      backgroundColor: 'rgba(75, 192, 192, 0.7)',
                      borderColor: 'rgba(75, 192, 192, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top'
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Box>

        {/* Final CTA */}
        {!isPremium && (
          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom color="primary">
              Ready to Enhance Your Reading Experience?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4 }} color="text.secondary">
              Join our community of premium readers today
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              onClick={() => handleSubscribe('Premium')}
              sx={{ 
                px: 6,
                py: 2,
                fontSize: '1.2rem'
              }}
            >
              Upgrade to Premium
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Subscription; 