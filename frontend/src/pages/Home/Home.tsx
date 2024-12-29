import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Container, Box, Typography, Paper, Fade, Button } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { styled } from '@mui/material/styles';
import ManualBookEntry from '../../components/ManualBookEntry/ManualBookEntry';
import { useNavigate } from 'react-router-dom';

const HeroSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(8),
  textAlign: 'center',
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(4),
}));

const FeatureBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const PricingCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Fade in timeout={800}>
        <Box sx={{ py: 4 }}>
          <HeroSection elevation={3}>
            <LibraryBooksIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              Your Personal Book Collection
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {isAuthenticated 
                ? "Add your latest reads to your collection below"
                : "Track, manage, and explore your reading journey with our intuitive book collection app"}
            </Typography>
          </HeroSection>

          {isAuthenticated ? (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" gutterBottom align="center" color="primary" sx={{ mb: 4 }}>
                Add New Book
              </Typography>
              <ManualBookEntry />
            </Box>
          ) : (
            <>
              <Box sx={{ mt: 6, mb: 8 }}>
                <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4 }}>
                  Features
                </Typography>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
                  gap: 3 
                }}>
                  <FeatureBox elevation={2}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Track Your Books
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Easily manage your entire book collection in one place
                    </Typography>
                  </FeatureBox>
                  <FeatureBox elevation={2}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Reading Stats
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      View detailed statistics about your reading habits
                    </Typography>
                  </FeatureBox>
                  <FeatureBox elevation={2}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Search & Filter
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Quickly find books in your collection
                    </Typography>
                  </FeatureBox>
                </Box>
              </Box>

              <Box sx={{ mt: 8, mb: 6 }}>
                <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4 }}>
                  Choose Your Plan
                </Typography>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                  gap: 4 
                }}>
                  <PricingCard elevation={3}>
                    <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                      Free
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                      $0
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Perfect for casual readers
                    </Typography>
                    <Box sx={{ textAlign: 'left', mb: 3 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>✓ Unlimited book entries</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>✓ Basic statistics</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>✓ Search and filter</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>✓ Reading progress tracking</Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="large"
                      onClick={() => navigate('/signup')}
                      sx={{ mt: 'auto' }}
                    >
                      Get Started
                    </Button>
                  </PricingCard>

                  <PricingCard elevation={3} sx={{ borderColor: 'primary.main', borderWidth: 2, borderStyle: 'solid' }}>
                    <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                      Premium
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                      $4.99
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      For dedicated book enthusiasts
                    </Typography>
                    <Box sx={{ textAlign: 'left', mb: 3 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>✓ All Free features</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>✓ Advanced reading analytics</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>✓ Reading speed tracking</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>✓ Genre insights</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>✓ Reading streaks</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>✓ Monthly progress reports</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>✓ Data export (CSV, JSON)</Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      onClick={() => navigate('/signup')}
                      sx={{ mt: 'auto' }}
                    >
                      Go Premium
                    </Button>
                  </PricingCard>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default Home;
