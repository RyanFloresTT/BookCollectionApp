import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Box, Button, Paper, Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyStats {
  month: string;
  booksStarted: number;
  booksCompleted: number;
}

interface PremiumStatsProps {
  isPremium: boolean;
  averageReadingTime: number | undefined;
  currentStreak: number | undefined;
  longestStreak: number | undefined;
  completionRate: number | undefined;
  monthlyStats: MonthlyStats[] | undefined;
  readingSpeed: number | undefined;
  totalReadingDays: number | undefined;
  readingHabits: { [key: string]: number } | undefined;
  genreVariety: { genre: string; count: number }[] | undefined;
  longestBook: { title: string; pages: number } | undefined;
  fastestRead: { title: string; daysToComplete: number; pagesPerDay: number } | undefined;
  bestRatedGenre: { genre: string; averageRating: number } | undefined;
  readingGoalProgress: { booksTarget: number; booksRead: number; percentComplete: number } | undefined;
}

interface StatsCardProps {
  title: string;
  value: string;
}

const StatsCard = ({ title, value }: StatsCardProps) => (
  <Paper 
    elevation={2}
    sx={{ 
      p: 3, 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      }
    }}
  >
    <Typography 
      variant="h6" 
      gutterBottom 
      color="primary.main"
      sx={{ 
        fontWeight: 'medium',
        mb: 2
      }}
    >
      {title}
    </Typography>
    <Typography 
      variant="body1" 
      sx={{ 
        fontSize: '1.1rem',
        fontWeight: 'medium'
      }}
    >
      {value}
    </Typography>
  </Paper>
);

const PremiumPrompt = () => (
  <Box>
    <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Upgrade to Premium to discover:
      </Typography>
      <Grid2 container spacing={2} sx={{ mb: 3, justifyContent: 'center' }}>
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography>📚 Reading Speed Analysis</Typography>
          <Typography>🎯 Personal Reading Goals</Typography>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography>📊 Reading Habit Patterns</Typography>
          <Typography>🏆 Achievement Tracking</Typography>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography>📈 Genre Exploration Stats</Typography>
          <Typography>⚡ Speed Reading Insights</Typography>
        </Grid2>
      </Grid2>
      <Button
        variant="contained"
        color="primary"
        onClick={() => window.location.href = '/premium'}
      >
        Upgrade Now
      </Button>
    </Paper>
  </Box>
);

export const PremiumStats = ({
  isPremium,
  averageReadingTime,
  currentStreak,
  longestStreak,
  completionRate,
  monthlyStats,
  readingSpeed,
  totalReadingDays,
  readingHabits,
  genreVariety,
  longestBook,
  fastestRead,
  bestRatedGenre,
  readingGoalProgress
}: PremiumStatsProps) => {
  const navigate = useNavigate();

  // Monthly stats chart data
  const chartData: ChartData<'bar'> | undefined = monthlyStats ? {
    labels: monthlyStats.map(stat => stat.month),
    datasets: [
      {
        label: 'Books Started',
        data: monthlyStats.map(stat => stat.booksStarted),
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      },
      {
        label: 'Books Completed',
        data: monthlyStats.map(stat => stat.booksCompleted),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  } : undefined;

  const chartOptions: ChartOptions<'bar'> = {
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
  };

  if (!isPremium) {
    return (
      <Grid2 container>
        <Grid2 size={{ xs: 12 }}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Unlock Advanced Reading Insights
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Upgrade to Premium to discover:
            </Typography>
            <Grid2 container spacing={2} sx={{ mb: 3, justifyContent: 'center' }}>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography>📚 Reading Speed Analysis</Typography>
                <Typography>🎯 Personal Reading Goals</Typography>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography>📊 Reading Habit Patterns</Typography>
                <Typography>🏆 Achievement Tracking</Typography>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography>📈 Genre Exploration Stats</Typography>
                <Typography>⚡ Speed Reading Insights</Typography>
              </Grid2>
            </Grid2>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/subscription')}
              size="large"
            >
              Upgrade Now
            </Button>
          </Paper>
        </Grid2>
      </Grid2>
    );
  }

  // Genre variety display
  const genreVarietyDisplay = genreVariety ? (
    <Typography variant="body1">
      You've explored {genreVariety.map(g => g.genre).join(', ')}
    </Typography>
  ) : null;

  // Completion rate display
  const completionRateDisplay = completionRate !== undefined ? (
    <Typography variant="body1">
      {Math.round(completionRate)}% completion rate
    </Typography>
  ) : null;

  return (
    <Box sx={{ py: 2 }}>
      {!isPremium ? (
        <PremiumPrompt />
      ) : (
        <Grid2 container spacing={3}>
          {/* Reading Speed */}
          {readingSpeed && (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
              <StatsCard
                title="📚 Reading Speed"
                value={`${Math.round(readingSpeed)} pages/day`}
              />
            </Grid2>
          )}

          {/* Total Reading Days */}
          {totalReadingDays && (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
              <StatsCard
                title="📅 Total Reading Days"
                value={totalReadingDays.toString()}
              />
            </Grid2>
          )}

          {/* Reading Habits */}
          {readingHabits && (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
              <StatsCard
                title="⏰ Favorite Reading Time"
                value={Object.entries(readingHabits)
                  .sort((a, b) => b[1] - a[1])[0][0]
                  .replace(/([A-Z])/g, ' $1')
                  .trim()}
              />
            </Grid2>
          )}

          {/* Genre Variety */}
          {genreVariety && genreVariety.length > 0 && (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
              <StatsCard
                title="📚 Genre Variety"
                value={`${genreVariety.length} genres`}
              />
            </Grid2>
          )}

          {/* Longest Book */}
          {longestBook && (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
              <StatsCard
                title="📖 Longest Book"
                value={`${longestBook.title} (${longestBook.pages} pages)`}
              />
            </Grid2>
          )}

          {/* Fastest Read */}
          {fastestRead && (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
              <StatsCard
                title="⚡ Fastest Read"
                value={`${fastestRead.title} (${fastestRead.pagesPerDay} pages/day)`}
              />
            </Grid2>
          )}

          {/* Best Rated Genre */}
          {bestRatedGenre && (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
              <StatsCard
                title="⭐ Best Rated Genre"
                value={`${bestRatedGenre.genre} (${bestRatedGenre.averageRating.toFixed(1)} stars)`}
              />
            </Grid2>
          )}

          {/* Reading Goal Progress */}
          {readingGoalProgress && (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
              <StatsCard
                title="🎯 Reading Goal Progress"
                value={`${readingGoalProgress.booksRead}/${readingGoalProgress.booksTarget} books (${Math.round(readingGoalProgress.percentComplete)}%)`}
              />
            </Grid2>
          )}

          {/* Monthly Stats Chart */}
          {chartData && (
            <Grid2 size={{ xs: 12 }}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  color="primary.main"
                  sx={{ 
                    fontWeight: 'medium',
                    mb: 3
                  }}
                >
                  📊 Monthly Reading Progress
                </Typography>
                <Bar data={chartData} options={chartOptions} />
              </Paper>
            </Grid2>
          )}
        </Grid2>
      )}
    </Box>
  );
}; 