import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Snackbar,
  Typography,
  Paper,
  Rating,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Alert,
  Divider,
  Card,
  CardMedia,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../../services/api';
import { genres } from './genres';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const DEFAULT_COVER = 'https://placehold.co/200x300?text=No+Cover';

const ManualBookEntry: React.FC = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [bookDetails, setBookDetails] = useState({
    title: '',
    author: '',
    coverImage: '',
    rating: 0,
    pageCount: 0,
    genre: '',
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [readingStatus, setReadingStatus] = useState('not_started');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [finishDate, setFinishDate] = useState<Date | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setBookDetails((prevDetails) => ({
      ...prevDetails,
      [name]: name === 'pageCount' ? Math.max(0, Number(value)) : value,
    }));
    if (name === 'coverImage') {
      setImageError(false);
    }
  };

  const handleGenreChange = (event: SelectChangeEvent<string>) => {
    setBookDetails((prevDetails) => ({
      ...prevDetails,
      genre: event.target.value as string,
    }));
  };

  const handleRatingChange = (event: React.ChangeEvent<{}>, newValue: number | null) => {
    setBookDetails((prevDetails) => ({
      ...prevDetails,
      rating: newValue ?? 0,
    }));
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleSubmit = async () => {
    try {
      const token = await getAccessTokenSilently();
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const response = await api.post('/books/add', {
        title: bookDetails.title,
        author: bookDetails.author,
        coverImage: bookDetails.coverImage || DEFAULT_COVER,
        rating: bookDetails.rating,
        pageCount: bookDetails.pageCount,
        genre: bookDetails.genre,
        started_at: startDate?.toISOString() || null,
        finished_at: finishDate?.toISOString() || null,
      });

      if (response.status === 201) {
        setSuccess('Book added to your collection!');
        setBookDetails({
          title: '',
          author: '',
          coverImage: '',
          rating: 0,
          pageCount: 0,
          genre: '',
        });
        setStartDate(null);
        setFinishDate(null);
        setReadingStatus('not_started');
      }
    } catch (err) {
      console.error('Error adding book:', err);
      setError('Failed to add book to collection');
    }
  };

  if (!isAuthenticated) {
    return (
      <Paper elevation={3}>
        <Box p={4} textAlign="center">
          <Typography variant="h5" gutterBottom color="primary">
            Welcome to BookCollectionApp!
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" sx={{ mb: 2 }}>
            Effortlessly manage your book collection, explore insightful statistics, and much more.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Support us to unlock advanced features like detailed stats and weekly, monthly, or yearly summaries.
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Log in now to start organizing and enhancing your reading journey!
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3}>
      <Box p={4}>
        <Grid2 container spacing={4}>
          {/* Left side - Book Cover Preview */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            <Card elevation={2}>
              <CardMedia
                component="img"
                image={imageError || !bookDetails.coverImage ? DEFAULT_COVER : bookDetails.coverImage}
                alt="Book cover preview"
                onError={handleImageError}
                sx={{
                  height: 300,
                  objectFit: 'cover',
                  bgcolor: 'grey.100'
                }}
              />
            </Card>
            <Typography 
              variant="caption" 
              display="block" 
              textAlign="center" 
              sx={{ mt: 1, color: 'text.secondary' }}
            >
              Book Cover Preview
            </Typography>
          </Grid2>

          {/* Right side - Book Details Form */}
          <Grid2 size={{ xs: 12, md: 8 }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Title"
                name="title"
                value={bookDetails.title}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
              />
              <TextField
                label="Author"
                name="author"
                value={bookDetails.author}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
              />
              <TextField
                label="Cover Image URL"
                name="coverImage"
                value={bookDetails.coverImage}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                helperText={imageError ? "Invalid image URL. Using default cover." : "Enter a valid image URL for the book cover"}
                error={imageError}
              />
              <TextField
                label="Page Count"
                name="pageCount"
                type="number"
                value={bookDetails.pageCount}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                inputProps={{ min: 0 }}
              />
              <FormControl fullWidth variant="outlined">
                <InputLabel>Genre</InputLabel>
                <Select
                  value={bookDetails.genre}
                  onChange={handleGenreChange}
                  label="Genre"
                >
                  {genres.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <Typography component="legend" sx={{ mb: 1 }}>Rating</Typography>
                <Rating
                  name="rating"
                  value={bookDetails.rating}
                  precision={0.5}
                  onChange={handleRatingChange}
                  size="large"
                />
              </Box>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Reading Status</InputLabel>
                <Select
                  value={readingStatus}
                  onChange={(e) => {
                    const status = e.target.value;
                    setReadingStatus(status);
                    if (status === 'not_started') {
                      setStartDate(null);
                      setFinishDate(null);
                    } else if (status === 'in_progress') {
                      setStartDate(startDate || new Date());
                      setFinishDate(null);
                    }
                  }}
                  label="Reading Status"
                >
                  <MenuItem value="not_started">Not Started</MenuItem>
                  <MenuItem value="in_progress">Currently Reading</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                {(readingStatus === 'in_progress' || readingStatus === 'completed') && (
                  <DatePicker
                    label="Started Reading"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    sx={{ mb: 2, width: '100%' }}
                    slots={{ textField: TextField }}
                    slotProps={{
                      textField: { fullWidth: true }
                    }}
                  />
                )}
                
                {readingStatus === 'completed' && (
                  <DatePicker
                    label="Finished Reading"
                    value={finishDate}
                    onChange={(newValue) => setFinishDate(newValue)}
                    minDate={startDate || undefined}
                    sx={{ mb: 2, width: '100%' }}
                    slots={{ textField: TextField }}
                    slotProps={{
                      textField: { fullWidth: true }
                    }}
                  />
                )}
              </LocalizationProvider>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={!bookDetails.title || !bookDetails.author}
                >
                  Add Book
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setBookDetails({
                    title: '',
                    author: '',
                    coverImage: '',
                    rating: 0,
                    pageCount: 0,
                    genre: '',
                  })}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Grid2>
        </Grid2>

        <Snackbar 
          open={!!success} 
          autoHideDuration={6000} 
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccess(null)} severity="success" variant="filled">
            {success}
          </Alert>
        </Snackbar>
        
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error" variant="filled">
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Paper>
  );
};

export default ManualBookEntry;
