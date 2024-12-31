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
import { Box, Button, Paper, Typography, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { Bar, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';

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
  genreVariety: { genre: string; count: number }[] | undefined;
  longestBook: { title: string; pages: number } | undefined;
  fastestRead: { title: string; daysToComplete: number; pagesPerDay: number } | undefined;
  bestRatedGenre: { genre: string; averageRating: number } | undefined;
  readingGoalProgress: { booksTarget: number; booksRead: number; percentComplete: number } | undefined;
  pagesPerGenreData: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
    }[];
  };
  onUpdateReadingGoal: (newGoal: number) => Promise<void>;
  peakReadingSeason?: {
    season: string;
    count: number;
  };
  readingVelocity?: {
    trend: 'increasing' | 'decreasing' | 'stable';
    percentage: number;
  };
  bookLengthStats?: {
    sweetSpot: { range: string; count: number };
    lengthDistribution: { short: number; medium: number; long: number };
  };
  ratingAnalytics?: {
    ratingByLength: { short: number; medium: number; long: number };
    genreSatisfaction: { [genre: string]: number };
    criticalIndex: number;
  };
  genreAnalytics?: {
    genreEvolution: { genre: string; trend: 'up' | 'down' | 'stable' }[];
    speedByGenre: { genre: string; averageSpeed: number }[];
    genreCombinations: { genres: [string, string]; count: number }[];
    completionPatterns: { genre: string; avgCompletionDays: number }[];
    readingSprints: {
      startDate: string;
      endDate: string;
      booksCompleted: number;
      daysElapsed: number;
    }[];
  };
  timeAnalytics?: {
    weekendReader: boolean;
    averageCompletionByGenre: { [genre: string]: number };
  };
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

interface GoalProgressProps {
  current: number;
  target: number;
  onEditGoal: () => void;
}

const GoalProgress = ({ current, target, onEditGoal }: GoalProgressProps) => {
  const progress = (current / target) * 100;
  const remaining = target - current;
  const isAhead = current > (target * (new Date().getMonth() + 1) / 12);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3,
        mb: 4,
        background: 'linear-gradient(to right, rgba(0,0,0,0.02), rgba(0,0,0,0.05))',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" color="primary" sx={{ fontWeight: 'medium' }}>
          {new Date().getFullYear()} Reading Goal
        </Typography>
        <IconButton onClick={onEditGoal} size="small" sx={{ color: 'primary.main' }}>
          <EditIcon />
        </IconButton>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ position: 'relative', mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(progress, 100)}
          sx={{
            height: 20,
            borderRadius: 2,
            backgroundColor: 'rgba(0,0,0,0.05)',
            '& .MuiLinearProgress-bar': {
              background: isAhead
                ? 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)'
                : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              borderRadius: 2,
            },
          }}
        />
        <Typography
          variant="body2"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            textShadow: '0 0 4px rgba(0,0,0,0.5)',
            fontWeight: 'bold'
          }}
        >
          {Math.round(progress)}%
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
        <Typography variant="body1">
          <strong>{current}</strong> of <strong>{target}</strong> books read
        </Typography>
        <Typography variant="body1" color={isAhead ? 'success.main' : 'primary'}>
          {remaining > 0 
            ? `${remaining} books to go`
            : '🎉 Goal completed!'
          }
        </Typography>
      </Box>
    </Paper>
  );
};

interface GoalEditorDialogProps {
  open: boolean;
  currentGoal: number;
  onClose: () => void;
  onSave: (newGoal: number) => void;
}

const GoalEditorDialog = ({ open, currentGoal, onClose, onSave }: GoalEditorDialogProps) => {
  const [goal, setGoal] = useState(currentGoal);

  const handleSave = () => {
    if (goal > 0) {
      onSave(goal);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Reading Goal</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          How many books would you like to read this year?
        </Typography>
        <TextField
          autoFocus
          label="Books per year"
          type="number"
          fullWidth
          value={goal}
          onChange={(e) => setGoal(Math.max(1, parseInt(e.target.value) || 0))}
          inputProps={{ min: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const PremiumStats = ({
  isPremium,
  averageReadingTime,
  currentStreak,
  longestStreak,
  completionRate,
  monthlyStats,
  readingSpeed,
  totalReadingDays,
  genreVariety,
  longestBook,
  fastestRead,
  bestRatedGenre,
  readingGoalProgress,
  pagesPerGenreData,
  onUpdateReadingGoal,
  peakReadingSeason,
  readingVelocity,
  bookLengthStats,
  ratingAnalytics,
  genreAnalytics,
  timeAnalytics
}: PremiumStatsProps) => {
  const navigate = useNavigate();
  const [isGoalEditorOpen, setIsGoalEditorOpen] = useState(false);

  const handleEditGoal = () => {
    setIsGoalEditorOpen(true);
  };

  const handleSaveGoal = async (newGoal: number) => {
    try {
      await onUpdateReadingGoal(newGoal);
      setIsGoalEditorOpen(false);
    } catch (error) {
      console.error('Failed to update reading goal:', error);
    }
  };

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

  return (
    <Box sx={{ py: 2 }}>
      {/* Goal Progress */}
      {readingGoalProgress && isPremium && (
        <>
          <GoalProgress
            current={readingGoalProgress.booksRead}
            target={readingGoalProgress.booksTarget}
            onEditGoal={handleEditGoal}
          />
          <GoalEditorDialog
            open={isGoalEditorOpen}
            currentGoal={readingGoalProgress.booksTarget}
            onClose={() => setIsGoalEditorOpen(false)}
            onSave={handleSaveGoal}
          />
        </>
      )}

      {/* Key Stats Section */}
      <Grid2 container spacing={3} sx={{ mb: 4 }}>
        {/* Current Streak - Highlighted */}
        {typeof currentStreak === 'number' && (
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
                {currentStreak}
              </Typography>
              <Typography>days reading</Typography>
            </Paper>
          </Grid2>
        )}

        {/* Reading Speed - Highlighted */}
        {readingSpeed && (
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
                {Math.round(readingSpeed)}
              </Typography>
              <Typography>pages per day</Typography>
            </Paper>
          </Grid2>
        )}

        {/* Completion Rate - Highlighted */}
        {typeof completionRate === 'number' && (
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
                {Math.round(completionRate)}%
              </Typography>
              <Typography>of started books finished</Typography>
            </Paper>
          </Grid2>
        )}
      </Grid2>

      {/* Reading Patterns Section */}
      {isPremium && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
            📚 Reading Patterns
          </Typography>
          <Grid2 container spacing={3}>
            {/* Peak Season */}
            {peakReadingSeason && (
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard
                  title="Peak Season"
                  value={`${peakReadingSeason.season} (${peakReadingSeason.count} books)`}
                />
              </Grid2>
            )}
            
            {/* Reading Velocity */}
            {readingVelocity && (
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard
                  title="Progress Trend"
                  value={`${readingVelocity.trend === 'stable' ? 'Steady pace' : 
                    `${readingVelocity.trend === 'increasing' ? 'Getting faster' : 'Slowing down'} by ${readingVelocity.percentage.toFixed(1)}%`}`}
                />
              </Grid2>
            )}

            {/* Best Reading Sprint */}
            {genreAnalytics?.readingSprints[0] && (
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard
                  title="Best Sprint"
                  value={`${genreAnalytics.readingSprints[0].booksCompleted} books in ${genreAnalytics.readingSprints[0].daysElapsed} days`}
                />
              </Grid2>
            )}

            {/* Reading Pattern */}
            {timeAnalytics && (
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard
                  title="Preferred Days"
                  value={`${timeAnalytics.weekendReader ? 'Weekend' : 'Weekday'} reader`}
                />
              </Grid2>
            )}
          </Grid2>
        </Paper>
      )}

      {/* Genre Insights Section */}
      {isPremium && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
            📊 Genre Insights
          </Typography>
          <Grid2 container spacing={3}>
            {/* Genre Variety */}
            {genreVariety && genreVariety.length > 0 && (
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard
                  title="Genre Variety"
                  value={`${genreVariety.length} genres explored`}
                />
              </Grid2>
            )}

            {/* Best Rated Genre */}
            {bestRatedGenre && (
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard
                  title="Best Rated"
                  value={`${bestRatedGenre.genre} (${bestRatedGenre.averageRating.toFixed(1)} ⭐)`}
                />
              </Grid2>
            )}

            {/* Perfect Genre Pair */}
            {genreAnalytics?.genreCombinations[0] && (
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard
                  title="Perfect Pair"
                  value={`${genreAnalytics.genreCombinations[0].genres.join(' + ')}`}
                />
              </Grid2>
            )}

            {/* Fastest Genre */}
            {genreAnalytics?.speedByGenre[0] && (
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard
                  title="Fastest Genre"
                  value={`${genreAnalytics.speedByGenre[0].genre}`}
                />
              </Grid2>
            )}
          </Grid2>

          {/* Genre Distribution Chart */}
          {pagesPerGenreData && (
            <Box sx={{ 
              mt: 4, 
              height: { xs: 400, md: 300 },
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
                  data={pagesPerGenreData}
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
          )}
        </Paper>
      )}

      {/* Book Stats Section */}
      {isPremium && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
            📖 Book Stats
          </Typography>
          <Grid2 container spacing={3}>
            {/* Longest Book */}
            {longestBook && (
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard
                  title="Longest Book"
                  value={`${longestBook.title} (${longestBook.pages} pages)`}
                />
              </Grid2>
            )}

            {/* Fastest Read */}
            {fastestRead && (
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard
                  title="Fastest Read"
                  value={`${fastestRead.title} (${fastestRead.pagesPerDay} pages/day)`}
                />
              </Grid2>
            )}

            {/* Book Length Sweet Spot */}
            {bookLengthStats && (
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard
                  title="Sweet Spot"
                  value={`${bookLengthStats.sweetSpot.range} pages`}
                />
              </Grid2>
            )}

            {/* Rating Consistency */}
            {ratingAnalytics && (
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard
                  title="Rating Style"
                  value={`${(ratingAnalytics.criticalIndex * 100).toFixed(1)}% variation`}
                />
              </Grid2>
            )}
          </Grid2>
        </Paper>
      )}

      {/* Monthly Progress Chart */}
      {chartData && isPremium && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
            📈 Monthly Progress
          </Typography>
          <Bar data={chartData} options={chartOptions} />
        </Paper>
      )}

      {/* Premium Prompt at the bottom */}
      {!isPremium && (
        <Grid2 container>
          <Grid2 size={{ xs: 12 }} sx={{ mt: 4, mb: 6 }}>
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
      )}
    </Box>
  );
}; 