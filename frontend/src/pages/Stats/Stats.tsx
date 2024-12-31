import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { Bar } from 'react-chartjs-2';
import { useAuth0 } from '@auth0/auth0-react';
import { BasicStats } from './components/sections/BasicStats';
import { KeyStats } from './components/sections/KeyStats';
import { ReadingPatterns } from './components/sections/ReadingPatterns';
import { GenreInsights } from './components/sections/GenreInsights';
import { BookStats } from './components/sections/BookStats';
import { ReadingGoal } from './components/sections/ReadingGoal';
import { PremiumCTA } from './components/sections/PremiumCTA';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';
import { Book } from '../../types/Book';
import api from '../../services/api';
import '../../config/chartjs';

export const Stats: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [books, setBooks] = React.useState<Book[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { isPremium } = useSubscriptionStatus();

  React.useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await api.get('/books/collection');
        const completedBooks = data.books.filter((b: Book) => b.finished_at);
        setBooks(data.books);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [getAccessTokenSilently]);

  // Calculate monthly progress data
  const monthlyData = React.useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const startedByMonth = new Array(12).fill(0);
    const finishedByMonth = new Array(12).fill(0);

    books.forEach(book => {
      if (book.started_at) {
        const startDate = new Date(book.started_at);
        if (startDate.getFullYear() === new Date().getFullYear()) {
          startedByMonth[startDate.getMonth()]++;
        }
      }
      if (book.finished_at) {
        const completedDate = new Date(book.finished_at);
        if (completedDate.getFullYear() === new Date().getFullYear()) {
          finishedByMonth[completedDate.getMonth()]++;
        }
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Books Started',
          data: startedByMonth,
          backgroundColor: 'rgba(255, 159, 64, 0.7)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1
        },
        {
          label: 'Books Finished',
          data: finishedByMonth,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  }, [books]);

  // Calculate ratings distribution
  const ratingsData = React.useMemo(() => {
    // Create an array with 11 elements (0 to 5 stars, including half stars)
    const ratings = new Array(11).fill(0);
    books.forEach(book => {
      if (typeof book.rating === 'number') {
        // Convert rating to index (multiply by 2 to handle half stars)
        const index = Math.round(book.rating * 2);
        if (index >= 0 && index <= 10) {
          ratings[index]++;
        }
      }
    });

    return {
      labels: [
        '0', '½', '⭐', '⭐½', '⭐⭐', '⭐⭐½', 
        '⭐⭐⭐', '⭐⭐⭐½', '⭐⭐⭐⭐', '⭐⭐⭐⭐½', '⭐⭐⭐⭐⭐'
      ],
      datasets: [{
        label: 'Books',
        data: ratings,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };
  }, [books]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Basic Stats Section */}
        <BasicStats books={books} />

        {/* Genre Insights - Now in Free Tier */}
        <GenreInsights books={books} />

        {/* Ratings Distribution */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" color="primary" gutterBottom>
            📊 Ratings Distribution
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            See how you've rated your books
          </Typography>
          <Box sx={{ height: 300, width: '100%' }}>
            <Bar
              data={ratingsData}
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
                    display: false
                  }
                }
              }}
            />
          </Box>
        </Paper>

        {/* Premium Stats Section */}
        {isPremium ? (
          <>
            <ReadingGoal books={books} />
            <KeyStats books={books} />
            <ReadingPatterns books={books} />
            <BookStats books={books} />
            {/* Monthly Progress Graph */}
            <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
              <Typography variant="h5" color="primary" gutterBottom>
                📈 Monthly Progress
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Track your reading progress over time
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <Bar
                  data={monthlyData}
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
          </>
        ) : (
          <PremiumCTA />
        )}
      </Box>
    </Container>
  );
};
