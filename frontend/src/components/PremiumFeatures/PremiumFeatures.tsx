import React from 'react';
import { Box, Typography, Paper, LinearProgress } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import { Bar, Pie } from 'react-chartjs-2';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { MenuBook, AutoStories, Category } from '@mui/icons-material';

export const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

// Example data for feature previews
export const exampleReadingSpeedData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [{
    label: 'Pages per Day',
    data: [45, 52, 58, 65],
    fill: true,
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    borderColor: 'rgba(75, 192, 192, 1)',
  }]
};

export const exampleGenreProgressData = {
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
};

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const Feature: React.FC<FeatureProps> = ({ title, description, icon, children }) => (
  <FeatureCard elevation={2}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {icon}
      <Typography variant="h6" color="primary" sx={{ ml: 1 }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="body1" sx={{ mb: 3 }}>
      {description}
    </Typography>
    {children}
  </FeatureCard>
);

export const KeyStatsFeature: React.FC = () => (
  <Feature
    title="Key Statistics"
    description="Track your reading progress with detailed metrics"
    icon={<AutoGraphIcon color="primary" />}
  >
    <Grid2 container spacing={3}>
      <Grid2 size={{ xs: 12, md: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            height: '100%',
            background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
            color: 'white'
          }}
        >
          <Typography variant="h6" gutterBottom>Current Streak</Typography>
          <Typography variant="h3" sx={{ mb: 2 }}>
            12
          </Typography>
          <Typography>days reading</Typography>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            height: '100%',
            background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
            color: 'white'
          }}
        >
          <Typography variant="h6" gutterBottom>Reading Speed</Typography>
          <Typography variant="h3" sx={{ mb: 2 }}>
            42
          </Typography>
          <Typography>pages per day</Typography>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            height: '100%',
            background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
            color: 'white'
          }}
        >
          <Typography variant="h6" gutterBottom>Completion Rate</Typography>
          <Typography variant="h3" sx={{ mb: 2 }}>
            85%
          </Typography>
          <Typography>of started books finished</Typography>
        </Paper>
      </Grid2>
    </Grid2>
  </Feature>
);

export const ReadingPatternsFeature: React.FC = () => (
  <Feature
    title="Reading Patterns"
    description="Discover your reading habits and preferences"
    icon={<MenuBook color="primary" />}
  >
    <Grid2 container spacing={3}>
      <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom color="primary">Peak Season</Typography>
          <Typography variant="body1">Summer (15 books)</Typography>
        </Paper>
      </Grid2>
      
      <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom color="primary">Average Time</Typography>
          <Typography variant="body1">12 days per book</Typography>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom color="primary">Best Sprint</Typography>
          <Typography variant="body1">5 books in 14 days</Typography>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom color="primary">Completion Rate</Typography>
          <Typography variant="body1">85% finished</Typography>
        </Paper>
      </Grid2>
    </Grid2>
  </Feature>
);

export const GenreInsightsFeature: React.FC = () => (
  <Feature
    title="Genre Insights"
    description="Analyze your reading preferences across different genres"
    icon={<Category color="primary" />}
  >
    <Grid2 container spacing={3} sx={{ mb: 4 }}>
      <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom color="primary">Genre Variety</Typography>
          <Typography variant="body1">8 genres explored</Typography>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom color="primary">Best Rated</Typography>
          <Typography variant="body1">Fantasy (4.5 ⭐)</Typography>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom color="primary">Perfect Pair</Typography>
          <Typography variant="body1">Fantasy + Sci-Fi</Typography>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom color="primary">Fastest Genre</Typography>
          <Typography variant="body1">Mystery</Typography>
        </Paper>
      </Grid2>
    </Grid2>

    <Box sx={{ 
      mt: 4, 
      height: 300,
      width: '100%',
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      alignItems: 'center'
    }}>
      <Typography variant="h6" gutterBottom>Pages Read by Genre</Typography>
      <Box sx={{ 
        width: '100%',
        height: '100%',
        position: 'relative'
      }}>
        <Pie
          data={exampleGenreProgressData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 12,
                  font: {
                    size: 11
                  }
                },
              },
            },
          }}
        />
      </Box>
    </Box>
  </Feature>
);

export const BookStatsFeature: React.FC = () => (
  <Feature
    title="Book Stats"
    description="Get detailed insights about your reading preferences"
    icon={<AutoStories color="primary" />}
  >
    <Grid2 container spacing={3}>
      <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom color="primary">Longest Book</Typography>
          <Typography variant="body1">The Way of Kings (1007 pages)</Typography>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom color="primary">Fastest Read</Typography>
          <Typography variant="body1">Project Hail Mary (82 pages/day)</Typography>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom color="primary">Sweet Spot</Typography>
          <Typography variant="body1">300-400 pages</Typography>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom color="primary">Rating Style</Typography>
          <Typography variant="body1">15.2% variation</Typography>
        </Paper>
      </Grid2>
    </Grid2>
  </Feature>
);

export const MonthlyProgressFeature: React.FC = () => {
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Books Started',
        data: [2, 3, 2, 4, 3, 5],
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      },
      {
        label: 'Books Completed',
        data: [1, 2, 3, 3, 4, 4],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  return (
    <Feature
      title="Monthly Progress"
      description="Track your reading progress throughout the year"
      icon={<BarChartIcon color="primary" />}
    >
      <Box sx={{ width: '100%', height: 300 }}>
        <Bar
          data={monthlyData}
          options={{
            responsive: true,
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
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Reading Progress by Month'
              }
            }
          }}
        />
      </Box>
    </Feature>
  );
};

export const ReadingGoalFeature = () => {
  const progress = 75; // Demo progress
  const booksRead = 15;
  const goal = 20;

  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        📚 Reading Goal Progress
      </Typography>
      <Box sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {booksRead} of {goal} books read
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {progress}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 10, 
            borderRadius: 5,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              backgroundColor: progress >= 100 ? 'success.main' : 'primary.main',
            }
          }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary">
        Set yearly reading goals and track your progress with beautiful visualizations
      </Typography>
    </Box>
  );
}; 