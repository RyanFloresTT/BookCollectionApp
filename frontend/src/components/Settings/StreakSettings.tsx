import React from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../../services/api';

interface StreakSettingsProps {
  isPremium: boolean;
  onClose: () => void;
}

export const StreakSettings: React.FC<StreakSettingsProps> = ({ isPremium, onClose }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [excludedDays, setExcludedDays] = React.useState<number[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Fetch current settings on mount
  React.useEffect(() => {
    const fetchSettings = async () => {
      if (!isPremium) return;

      try {
        const response = await api.get<{ excluded_days: number[] }>('/user/streak-settings');
        
        // Ensure we have a valid response with excluded_days
        if (response.data && Array.isArray(response.data.excluded_days)) {
          setExcludedDays(response.data.excluded_days);
        } else {
          console.warn('Unexpected response format:', response.data);
          setExcludedDays([]);
        }
      } catch (err: any) {
        console.error('Error fetching streak settings:', err);
        // More specific error message based on the error type
        if (err.response) {
          setError(`Failed to load settings: ${err.response.data}`);
        } else if (err.request) {
          setError('No response from server. Please try again.');
        } else {
          setError('Failed to load streak settings');
        }
        setExcludedDays([]); // Set default empty array on error
      }
    };

    fetchSettings();
  }, [getAccessTokenSilently, isPremium]);

  const handleDayToggle = (day: number) => {
    setExcludedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSave = async () => {
    try {
      const response = await api.post('/user/streak-settings', {
        excluded_days: excludedDays
      });

      if (response.status === 200) {
        setSuccess('Streak settings saved successfully!');
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (err: any) {
      console.error('Error saving streak settings:', err);
      if (err.response) {
        setError(`Failed to save settings: ${err.response.data}`);
      } else if (err.request) {
        setError('No response from server. Please try again.');
      } else {
        setError('Failed to save streak settings');
      }
    }
  };

  if (!isPremium) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Customize your reading streak by excluding specific days from your streak calculations.
          This is a premium feature. Upgrade to customize your streak settings!
        </Alert>
      </Box>
    );
  }

  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Customize Reading Streak
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select the days you want to exclude from your reading streak calculations.
        Your streak won't be broken if you don't read on these days.
      </Typography>

      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
        <FormGroup>
          {days.map((day, index) => (
            <FormControlLabel
              key={day}
              control={
                <Checkbox
                  checked={excludedDays.includes(index)}
                  onChange={() => handleDayToggle(index)}
                />
              }
              label={day}
            />
          ))}
        </FormGroup>
      </Paper>

      <Divider sx={{ my: 2 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}; 