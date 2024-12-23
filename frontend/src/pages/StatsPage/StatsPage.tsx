import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Typography, Box, Grid } from '@mui/material';
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
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../../services/api';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement);

interface Book {
  id: number;
  title: string;
  author: string;
  rating?: number;
  page_count?: number;
}

const StatsPage: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [highestPageCount, setHighestPageCount] = useState<number | null>(null);
  const [lowestPageCount, setLowestPageCount] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [lineChartData, setLineChartData] = useState<any>(null);

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

        // Calculate stats
        const totalRatings = books.reduce((acc, book) => acc + (book.rating || 0), 0);
        const average = books.length > 0 ? totalRatings / books.length : 0;
        setAverageRating(average);

        const pageCounts = books.map((book) => book.page_count || 0);
        setHighestPageCount(Math.max(...pageCounts));
        setLowestPageCount(Math.min(...pageCounts));

        // Prepare bar chart data for ratings
        const labels = books.map((book) => book.title);
        const ratings = books.map((book) => book.rating || 0);
        const barData = {
          labels,
          datasets: [
            {
              label: 'Book Ratings',
              data: ratings,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        };
        setChartData(barData);

        // Prepare line chart data for page counts
        const lineData = {
          labels,
          datasets: [
            {
              label: 'Page Counts',
              data: pageCounts,
              fill: false,
              borderColor: 'rgba(255, 99, 132, 1)',
              tension: 0.1,
            },
          ],
        };
        setLineChartData(lineData);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [getAccessTokenSilently]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Stats
      </Typography>
      {averageRating !== null && (
        <Typography variant="body1" gutterBottom>
          Average Book Rating: {averageRating.toFixed(2)}
        </Typography>
      )}
      {highestPageCount !== null && (
        <Typography variant="body1" gutterBottom>
          Highest Page Count: {highestPageCount}
        </Typography>
      )}
      {lowestPageCount !== null && (
        <Typography variant="body1" gutterBottom>
          Lowest Page Count: {lowestPageCount}
        </Typography>
      )}
      <Grid container spacing={4} sx={{ mt: 4 }}>
        {chartData && (
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Book Ratings
            </Typography>
            <Bar data={chartData} />
          </Grid>
        )}
        {lineChartData && (
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Page Counts
            </Typography>
            <Line data={lineChartData} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default StatsPage;
