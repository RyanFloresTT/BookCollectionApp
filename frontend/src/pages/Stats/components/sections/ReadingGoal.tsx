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
  TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { FeatureSection } from '../../../../components/Stats/FeatureSection';
import { Book } from '../../../../types/Book';
import api from '../../../../services/api';
import { useSnackbar } from '../../../../hooks/useSnackbar';

interface ReadingGoalProps {
  books: Book[];
}

export const ReadingGoal: React.FC<ReadingGoalProps> = ({ books }) => {
  const [goal, setGoal] = React.useState<number | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [newGoal, setNewGoal] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  const booksReadThisYear = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return books.filter(book => {
      if (!book.finished_at) return false;
      const completionDate = new Date(book.finished_at);
      return completionDate.getFullYear() === currentYear;
    }).length;
  }, [books]);

  const progress = React.useMemo(() => {
    if (!goal || goal === 0) return 0;
    return Math.min(100, (booksReadThisYear / goal) * 100);
  }, [booksReadThisYear, goal]);

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
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
    setNewGoal('');
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
              {booksReadThisYear} of {goal || '0'} books read
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
      </FeatureSection>

      <Dialog open={isEditing} onClose={handleClose}>
        <DialogTitle>Set Reading Goal</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            How many books would you like to read this year?
          </Typography>
          <TextField
            autoFocus
            label="Reading Goal"
            type="number"
            fullWidth
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            inputProps={{ min: 1 }}
            helperText={error || `You've read ${booksReadThisYear} books so far this year`}
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