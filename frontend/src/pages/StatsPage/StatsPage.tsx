import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Typography, Box, Paper, Container, Divider } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import api from '../../services/api';
import { Book } from '../../types/book';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement, ArcElement);

const StatsPage: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [highestPageCount, setHighestPageCount] = useState<number | null>(null);
  const [lowestPageCount, setLowestPageCount] = useState<number | null>(null);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [mostCommonGenre, setMostCommonGenre] = useState<string>('');
  const [chartData, setChartData] = useState<any>(null);
  const [lineChartData, setLineChartData] = useState<any>(null);
  const [pieChartData, setPieChartData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await api.get('/books/collection', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const books: Book[] = response.data.books || [];

        // Calculate basic stats
        setTotalBooks(books.length);
        const totalRatings = books.reduce((acc, book) => acc + (book.rating || 0), 0);
        const average = books.length > 0 ? totalRatings / books.length : 0;
        setAverageRating(average);

        const pageCounts = books.map((book) => book.page_count || 0);
        setHighestPageCount(Math.max(...pageCounts));
        setLowestPageCount(Math.min(...pageCounts));
        setTotalPages(pageCounts.reduce((acc, count) => acc + count, 0));

        // Genre statistics
        const genres = books.map((book) => book.genre || 'Unknown');
        const genreCounts = genres.reduce((acc: { [key: string]: number }, genre) => {
          acc[genre] = (acc[genre] || 0) + 1;
          return acc;
        }, {});

        // Find most common genre
        const mostCommon = Object.entries(genreCounts).reduce((a, b) => 
          (a[1] > b[1] ? a : b))[0];
        setMostCommonGenre(mostCommon);

        // Prepare pie chart data
        setPieChartData({
          labels: Object.keys(genreCounts),
          datasets: [
            {
              data: Object.values(genreCounts),
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40',
              ],
            },
          ],
        });

        // Prepare bar chart data for ratings distribution
        const ratingCounts = Array(5).fill(0);
        books.forEach((book) => {
          if (book.rating) {
            ratingCounts[Math.floor(book.rating) - 1]++;
          }
        });

        setChartData({
          labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
          datasets: [
            {
              label: 'Number of Books',
              data: ratingCounts,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        });

        // Prepare line chart data for page counts
        const sortedBooks = [...books].sort((a, b) => 
          (a.page_count || 0) - (b.page_count || 0));
        
        setLineChartData({
          labels: sortedBooks.map((_, index) => `Book ${index + 1}`),
          datasets: [
            {
              label: 'Page Count Distribution',
              data: sortedBooks.map(book => book.page_count),
              borderColor: 'rgba(75, 192, 192, 1)',
              tension: 0.4,
              fill: false,
            },
          ],
        });

      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, [getAccessTokenSilently]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
          Library Statistics
        </Typography>

        <Grid2 container spacing={3}>
          {/* Key Statistics Cards */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', backgroundColor: 'primary.light', color: 'white' }}>
              <Typography variant="h6" gutterBottom>Total Books</Typography>
              <Typography variant="h3">{totalBooks}</Typography>
            </Paper>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', backgroundColor: 'secondary.light', color: 'white' }}>
              <Typography variant="h6" gutterBottom>Average Rating</Typography>
              <Typography variant="h3">{averageRating?.toFixed(1) || '0'}</Typography>
            </Paper>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', backgroundColor: 'success.light', color: 'white' }}>
              <Typography variant="h6" gutterBottom>Total Pages</Typography>
              <Typography variant="h3">{totalPages.toLocaleString()}</Typography>
            </Paper>
          </Grid2>

          {/* Additional Statistics */}
          <Grid2 size={12}>
            <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" gutterBottom>Additional Insights</Typography>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <Typography variant="body1">Highest Page Count: {highestPageCount}</Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <Typography variant="body1">Lowest Page Count: {lowestPageCount}</Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <Typography variant="body1">Most Common Genre: {mostCommonGenre}</Typography>
                </Grid2>
              </Grid2>
            </Paper>
          </Grid2>

          {/* Charts */}
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>Rating Distribution</Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                {chartData && <Bar data={chartData} options={{ 
                  maintainAspectRatio: false,
                  responsive: true
                }} />}
              </Box>
            </Paper>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>Genre Distribution</Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                {pieChartData && <Pie data={pieChartData} options={{ 
                  maintainAspectRatio: false,
                  responsive: true
                }} />}
              </Box>
            </Paper>
          </Grid2>

          <Grid2 size={12}>
            <Paper elevation={3} sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>Page Count Distribution</Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                {lineChartData && <Line data={lineChartData} options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Pages'
                      }
                    }
                  }
                }} />}
              </Box>
            </Paper>
          </Grid2>
        </Grid2>
      </Box>
    </Container>
  );
};

export default StatsPage;
