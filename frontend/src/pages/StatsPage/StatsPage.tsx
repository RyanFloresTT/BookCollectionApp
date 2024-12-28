import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from '../../hooks/useSnackbar';
import { Container, CircularProgress, Typography } from '@mui/material';
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
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';
import { useBooks } from '../../hooks/useBooks';
import { KeyStatistics } from './components/KeyStatistics';
import { AdditionalInsights } from './components/AdditionalInsights';
import { ChartSection } from './components/ChartSection';
import { PremiumStats } from './components/PremiumStats';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement, ArcElement);
 
const StatsPage: React.FC = () => {
  const { isAuthenticated, loginWithRedirect, isLoading: authLoading } = useAuth0();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [highestPageCount, setHighestPageCount] = useState<number | null>(null);
  const [lowestPageCount, setLowestPageCount] = useState<number | null>(null);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [mostCommonGenre, setMostCommonGenre] = useState<string>('');
  const [chartData, setChartData] = useState<any>(null);
  const [lineChartData, setLineChartData] = useState<any>(null);
  const [pieChartData, setPieChartData] = useState<any>(null);
  
  // Premium stats states
  const [averageReadingTime, setAverageReadingTime] = useState<number | null>(null);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [monthlyStats, setMonthlyStats] = useState<any>(null);
  const [completionRate, setCompletionRate] = useState<number>(0);

  const subscriptionStatus = useSubscriptionStatus();
  const isPremium = subscriptionStatus === 'premium';
  const { books, isLoading: booksLoading, error: booksError } = useBooks();

  useEffect(() => {
    // Don't redirect if auth is still loading
    if (authLoading) return;
    
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname + window.location.search }
      });
      return;
    }

    const status = searchParams.get('payment_status');
    if (status === 'success') {
      showSnackbar('Welcome to Premium! Enjoy your enhanced statistics.', 'success');
      navigate('?', { replace: true });
    }
  }, [isAuthenticated, authLoading, searchParams, navigate, showSnackbar, loginWithRedirect]);

  useEffect(() => {
    if (!books || booksLoading) return;

    try {
      // Basic stats calculations
      setTotalBooks(books.length);
      const totalRatings = books.reduce((acc, book) => acc + (book.rating || 0), 0);
      const average = books.length > 0 ? totalRatings / books.length : 0;
      setAverageRating(average);

      const pageCounts = books.map((book) => book.page_count || 0);
      setHighestPageCount(Math.max(...pageCounts));
      setLowestPageCount(Math.min(...pageCounts));
      setTotalPages(pageCounts.reduce((acc, count) => acc + count, 0));

      // Premium stats calculations (if premium)
      if (isPremium) {
        // Calculate average reading time
        const booksWithDates = books.filter(book => book.started_at && book.finished_at);
        if (booksWithDates.length > 0) {
          const readingTimes = booksWithDates.map(book => {
            const start = new Date(book.started_at!);
            const end = new Date(book.finished_at!);
            return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)); // days
          });
          const avgTime = readingTimes.reduce((acc, time) => acc + time, 0) / readingTimes.length;
          setAverageReadingTime(Math.round(avgTime));
        }

        // Calculate reading streaks
        const readingDates = books
          .filter(book => book.started_at || book.finished_at)
          .flatMap(book => [
            book.started_at && new Date(book.started_at),
            book.finished_at && new Date(book.finished_at)
          ])
          .filter(Boolean) as Date[];

        if (readingDates.length > 0) {
          readingDates.sort((a, b) => b.getTime() - a.getTime());
          
          // Current streak
          let streak = 0;
          const today = new Date();
          let currentDate = today;
          
          for (const date of readingDates) {
            if (isConsecutiveDay(currentDate, date)) {
              streak++;
              currentDate = date;
            } else {
              break;
            }
          }
          setCurrentStreak(streak);

          // Longest streak
          let maxStreak = 0;
          let currentStreak = 0;
          let lastDate: Date | null = null;

          for (const date of readingDates) {
            if (!lastDate || isConsecutiveDay(lastDate, date)) {
              currentStreak++;
            } else {
              currentStreak = 1;
            }
            maxStreak = Math.max(maxStreak, currentStreak);
            lastDate = date;
          }
          setLongestStreak(maxStreak);
        }

        // Monthly stats
        const monthlyData = Array(12).fill(0);
        books
          .filter(book => book.finished_at)
          .forEach(book => {
            const month = new Date(book.finished_at!).getMonth();
            monthlyData[month]++;
          });

        setMonthlyStats({
          labels: [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ],
          datasets: [{
            label: 'Books Completed',
            data: monthlyData,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          }],
        });

        // Completion rate
        const startedCount = books.filter(book => book.started_at).length;
        const finishedCount = books.filter(book => book.finished_at).length;
        setCompletionRate(startedCount > 0 ? (finishedCount / startedCount) * 100 : 0);
      }

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
      const ratingCounts = Array(10).fill(0);
      books.forEach((book) => {
        if (book.rating) {
          const index = Math.round(book.rating * 2) - 1;
          if (index >= 0 && index < ratingCounts.length) {
            ratingCounts[index]++;
          }
        }
      });

      setChartData({
        labels: ['0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5'].map(r => `${r} Stars`),
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
      console.error('Failed to calculate stats:', error);
    }
  }, [books, booksLoading, isPremium]);

  // Helper function to check if two dates are consecutive days
  const isConsecutiveDay = (date1: Date, date2: Date): boolean => {
    const diffTime = Math.abs(date1.getTime() - date2.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  };

  if (authLoading || booksLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (booksError) {
    return (
      <Container>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12 }}>
            <Typography variant="h6" color="error">
              Error loading statistics. Please try again later.
            </Typography>
          </Grid2>
        </Grid2>
      </Container>
    );
  }

  return (
    <Container>
      <Grid2 container spacing={3} sx={{ py: 4 }}>
        <Grid2 size={{ xs: 12 }}>
          <KeyStatistics
            totalBooks={totalBooks}
            averageRating={averageRating}
            totalPages={totalPages}
          />
        </Grid2>

        <Grid2 size={{ xs: 12 }}>
          <AdditionalInsights
            highestPageCount={highestPageCount}
            lowestPageCount={lowestPageCount}
            mostCommonGenre={mostCommonGenre}
          />
        </Grid2>

        <Grid2 size={{ xs: 12 }}>
          <ChartSection
            chartData={chartData}
            pieChartData={pieChartData}
            lineChartData={lineChartData}
          />
        </Grid2>

        <Grid2 size={{ xs: 12 }}>
          <PremiumStats
            isPremium={isPremium}
            averageReadingTime={averageReadingTime}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            completionRate={completionRate}
            monthlyStats={monthlyStats}
          />
        </Grid2>
      </Grid2>
    </Container>
  );
};

export default StatsPage;
