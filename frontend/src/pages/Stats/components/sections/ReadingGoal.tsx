import React from 'react';
import { 
  Box, 
  LinearProgress, 
  Typography, 
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid2,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { FeatureSection } from '../../../../components/Stats/FeatureSection';
import { Book } from '../../../../types/book';
import api from '../../../../services/api';
import { useSnackbar } from '../../../../hooks/useSnackbar';
import { useQuery } from '@tanstack/react-query';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { StatCard } from '../../../../components/Stats/StatCard';

interface ReadingGoalProps {
  books: Book[];
}

interface StreakSettings {
  auth0_id: string;
  excluded_days: number[];
  goal_interval: string;
  created_at: string;
  updated_at: string;
}

interface GoalStats {
  current_goal_streak: number;
  longest_goal_streak: number;
  total_goals_set: number;
  total_goals_met: number;
  goal_completion_rate: number;
  average_overshoot: number;
  best_interval: string;
  last_goal_met: string | null;
}

export const ReadingGoal: React.FC<ReadingGoalProps> = ({ books }): JSX.Element => {
  const [goal, setGoal] = React.useState<number | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [newGoal, setNewGoal] = React.useState<string>('');
  const [newInterval, setNewInterval] = React.useState<string>('yearly');
  const [error, setError] = React.useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  // Fetch goal stats
  const { data: goalStats } = useQuery<GoalStats>({
    queryKey: ['goalStats'],
    queryFn: async () => {
      const response = await api.get('/user/goal-stats');
      return response.data;
    }
  });

  // Fetch streak settings for the interval
  const { data: streakSettings, refetch: refetchSettings } = useQuery<StreakSettings>({
    queryKey: ['streakSettings'],
    queryFn: async (): Promise<StreakSettings> => {
      const response = await api.get('/user/streak-settings');
      return response.data;
    },
    initialData: {
      auth0_id: '',
      excluded_days: [],
      goal_interval: 'yearly',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  });

  const getIntervalStart = (date: Date, interval: string): Date => {
    const result = new Date(date);
    switch (interval) {
      case 'daily':
        result.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        const day = result.getDay();
        result.setDate(result.getDate() - day);
        result.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        break;
      case 'yearly':
        result.setMonth(0, 1);
        result.setHours(0, 0, 0, 0);
        break;
    }
    return result;
  };

  const booksReadInInterval = React.useMemo(() => {
    const now = new Date();
    const start = getIntervalStart(now, streakSettings.goal_interval);
    
    return books.filter(book => {
      if (!book.finished_at) return false;
      const completionDate = new Date(book.finished_at);
      return completionDate >= start && completionDate <= now;
    }).length;
  }, [books, streakSettings.goal_interval]);

  const progress = React.useMemo(() => {
    if (!goal || goal === 0) return 0;
    return Math.min(100, (booksReadInInterval / goal) * 100);
  }, [booksReadInInterval, goal]);

  React.useEffect(() => {
    const fetchGoal = async () => {
      try {
        const response = await api.get('/user/reading-goal');
        if (response.data && typeof response.data.readingGoal === 'number') {
          setGoal(response.data.readingGoal);
        } else {
          setGoal(0);
        }
      } catch (error) {
        showSnackbar('Error fetching reading goal', 'error');
        setGoal(0);
      }
    };

    fetchGoal();
  }, [showSnackbar]);

  const handleEditClick = () => {
    setNewGoal(goal ? goal.toString() : '0');
    setNewInterval(streakSettings.goal_interval);
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
    setNewGoal('');
    setNewInterval(streakSettings.goal_interval);
    setError(null);
  };

  const handleSave = async () => {
    const goalNumber = parseInt(newGoal, 10);
    if (isNaN(goalNumber) || goalNumber < 1) {
      setError('Please enter a valid number greater than 0');
      showSnackbar('Please enter a valid number greater than 0', 'error');
      return;
    }

    try {
      // Update interval first if it changed
      if (newInterval !== streakSettings.goal_interval) {
        await api.post('/user/streak-settings', {
          excluded_days: streakSettings.excluded_days,
          goal_interval: newInterval
        });
        await refetchSettings();
      }

      // Then update the goal
      const response = await api.put('/user/reading-goal', { readingGoal: goalNumber });
      if (response.data && typeof response.data.readingGoal === 'number') {
        setGoal(response.data.readingGoal);
      } else {
        setGoal(goalNumber);
      }
      setIsEditing(false);
      setError(null);
      showSnackbar('Reading goal updated successfully', 'success');
    } catch (error) {
      console.error('Error updating reading goal:', error);
      setError('Error updating reading goal');
      showSnackbar('Error updating reading goal', 'error');
    }
  };

  const getIntervalText = (interval: string): string => {
    switch (interval) {
      case 'daily':
        return 'today';
      case 'weekly':
        return 'this week';
      case 'monthly':
        return 'this month';
      case 'yearly':
        return 'this year';
      default:
        return 'this year';
    }
  };

  // Check if we need to reset the goal at interval boundaries
  React.useEffect(() => {
    const checkAndResetGoal = async () => {
      const now = new Date();
      const start = getIntervalStart(now, streakSettings.goal_interval);
      const lastUpdate = new Date(streakSettings.updated_at);
      
      // If the last update was in a previous interval, reset the goal
      if (lastUpdate < start) {
        try {
          const response = await api.put('/user/reading-goal', { readingGoal: goal });
          if (response.data && typeof response.data.readingGoal === 'number') {
            setGoal(response.data.readingGoal);
          }
        } catch (error) {
          console.error('Error resetting goal:', error);
        }
      }
    };

    checkAndResetGoal();
  }, [streakSettings.goal_interval, streakSettings.updated_at]);

  return (
    <>
      <FeatureSection 
        title="Reading Goal" 
        icon="🎯"
        action={
          <IconButton onClick={handleEditClick} size="small">
            <EditIcon />
          </IconButton>
        }
      >
        <Box sx={{ width: '100%', mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {booksReadInInterval} of {goal || '0'} books read {getIntervalText(streakSettings.goal_interval)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}%
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

        {/* Goal Stats */}
        <Grid2 container spacing={3} sx={{ mt: 2 }}>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Goal Streak"
              value={goalStats?.current_goal_streak ? goalStats.current_goal_streak.toString() : 'No streak'}
              subtitle="consecutive goals met"
              icon={<LocalFireDepartmentIcon />}
              color="#f44336"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Best Goal Streak"
              value={goalStats?.longest_goal_streak ? goalStats.longest_goal_streak.toString() : 'No data'}
              subtitle="consecutive goals met"
              icon={<TrendingUpIcon />}
              color="#2e7d32"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Goal Success Rate"
              value={goalStats?.goal_completion_rate ? `${Math.round(goalStats.goal_completion_rate)}%` : 'No data'}
              subtitle="of goals achieved"
              icon={<CheckCircleIcon />}
              color="#7b1fa2"
            />
          </Grid2>
        </Grid2>
      </FeatureSection>

      <Dialog open={isEditing} onClose={handleClose}>
        <DialogTitle>Set Reading Goal</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Set your reading goal interval and target
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Goal Interval</InputLabel>
            <Select
              value={newInterval}
              label="Goal Interval"
              onChange={(e) => setNewInterval(e.target.value)}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
          <TextField
            autoFocus
            label="Reading Goal"
            type="number"
            fullWidth
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            inputProps={{ min: 1 }}
            helperText={error || `You've read ${booksReadInInterval} books ${getIntervalText(newInterval)}`}
            error={!!error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 