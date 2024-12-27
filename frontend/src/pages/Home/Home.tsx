import React from 'react';
import { Box, Typography, Container, Paper, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { useAuth0 } from '@auth0/auth0-react';
import ManualBookEntry from '../../components/ManualBookEntry/ManualBookEntry';

const HeroSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: theme.palette.primary.contrastText,
  position: 'relative',
  overflow: 'hidden',
  textAlign: 'center',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%)',
    backgroundSize: '20px 20px',
    zIndex: 1,
  }
}));

const FeatureBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  }
}));

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth0();

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
            <Box sx={{ mt: 6 }}>
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
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default Home;
