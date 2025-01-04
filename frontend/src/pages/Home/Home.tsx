import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Container, Box, Typography, Paper, Fade, Button } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { styled } from '@mui/material/styles';
import ManualBookEntry from '../../components/ManualBookEntry/ManualBookEntry';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import DevelopmentNoticeModal from '../../components/DevelopmentModals/DevelopmentNoticeModal';

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

const StatsPreviewCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  background: theme.palette.background.paper,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '300px',
}));

// Example data for stats preview
const exampleMonthlyData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Books Read',
      data: [3, 4, 2, 5, 3, 4],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
  ],
};

const exampleRatingData = {
  labels: ['0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5'],
  datasets: [
    {
      label: 'Number of Books',
      data: [1, 2, 3, 4, 8, 10, 6, 4, 3, 1],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
  ],
};

// Example summary data
const summaryData = [
  { title: 'Total Books', value: '42', backgroundColor: 'primary.light' },
  { title: 'Average Rating', value: '4.2', backgroundColor: 'secondary.light' },
  { title: 'Total Pages', value: '12,458', backgroundColor: 'success.light' },
];

const Home: React.FC = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <DevelopmentNoticeModal />
      <Fade in timeout={800}>
        <Box sx={{ py: 4 }}>
          <HeroSection elevation={3}>
            <LibraryBooksIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              Your Personal Book Collection
            </Typography>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Track your reading journey, discover insights, and join a community of book lovers
            </Typography>
            {!isAuthenticated && (
              <Box>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => loginWithRedirect()}
                  sx={{ 
                    mt: 2,
                    mr: 2,
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }
                  }}
                >
                  Get Started - It's Free!
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/subscription')}
                  sx={{
                    mt: 2,
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.9)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  View Plans
                </Button>
              </Box>
            )}
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
                <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
                  Discover Your Reading Journey
                </Typography>
                
                {/* Example Stats Section */}
                <Box sx={{ mb: 4 }}>
                  <Grid2 container spacing={3}>
                    {summaryData.map((stat, index) => (
                      <Grid2 key={index} size={{ xs: 12, sm: 4 }}>
                        <Paper 
                          elevation={3} 
                          sx={{ 
                            p: 3, 
                            height: '100%', 
                            backgroundColor: stat.backgroundColor,
                            color: 'white'
                          }}
                        >
                          <Typography variant="h6" gutterBottom>{stat.title}</Typography>
                          <Typography variant="h3">{stat.value}</Typography>
                        </Paper>
                      </Grid2>
                    ))}
                  </Grid2>
                </Box>

                <Grid2 container spacing={4} sx={{ mb: 6 }}>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <StatsPreviewCard elevation={2}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Track Your Reading Progress
                      </Typography>
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxHeight: 300 }}>
                        <Bar data={exampleMonthlyData} options={{ 
                          responsive: true, 
                          maintainAspectRatio: true,
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 6
                            }
                          }
                        }} />
                      </Box>
                    </StatsPreviewCard>
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <StatsPreviewCard elevation={2}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Rating Distribution
                      </Typography>
                      <Box sx={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        maxHeight: 300 
                      }}>
                        <Bar 
                          data={exampleRatingData} 
                          options={{ 
                            responsive: true, 
                            maintainAspectRatio: true,
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: {
                                  display: true,
                                  text: 'Number of Books'
                                }
                              },
                              x: {
                                title: {
                                  display: true,
                                  text: 'Rating'
                                }
                              }
                            },
                            plugins: {
                              legend: {
                                display: false
                              },
                              tooltip: {
                                callbacks: {
                                  title: (tooltipItems) => `Rating: ${tooltipItems[0].label}`,
                                  label: (context) => `${context.raw} books`
                                }
                              }
                            }
                          }} 
                        />
                      </Box>
                    </StatsPreviewCard>
                  </Grid2>
                </Grid2>

                <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4 }}>
                  Core Features
                </Typography>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
                  gap: 3 
                }}>
                  <FeatureBox elevation={2}>
                    <LibraryBooksIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
                    <Typography variant="h6" gutterBottom color="primary">
                      Track Your Books
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Easily manage your entire book collection in one place
                    </Typography>
                  </FeatureBox>
                  <FeatureBox elevation={2}>
                    <BarChartIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
                    <Typography variant="h6" gutterBottom color="primary">
                      Reading Stats
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      View detailed statistics about your reading habits
                    </Typography>
                  </FeatureBox>
                  <FeatureBox elevation={2}>
                    <AutoGraphIcon sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
                    <Typography variant="h6" gutterBottom color="primary">
                      Search & Filter
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Quickly find books in your collection
                    </Typography>
                  </FeatureBox>
                </Box>
              </Box>

              {/* Final Call to Action */}
              <Box sx={{ mt: 8, mb: 6, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom color="primary">
                  Start Your Reading Journey Today
                </Typography>
                <Typography variant="h6" sx={{ mb: 4 }} color="text.secondary">
                  Join thousands of readers tracking their literary adventures
                </Typography>
                <Box>
                  <Button 
                    variant="contained" 
                    size="large" 
                    onClick={() => loginWithRedirect()}
                    sx={{ 
                      px: 6,
                      py: 2,
                      fontSize: '1.2rem',
                      mr: 2
                    }}
                  >
                    Create Your Free Account
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/subscription')}
                    sx={{
                      px: 6,
                      py: 2,
                      fontSize: '1.2rem'
                    }}
                  >
                    Compare Plans
                  </Button>
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
