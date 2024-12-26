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

const DEFAULT_COVER = 'https://via.placeholder.com/200x300?text=Book+Cover';

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
    if (!bookDetails.title || !bookDetails.author) {
      setError('Title and author are required.');
      return;
    }

    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "bookcollection.api",
        },
      });

      const response = await api.post('/books/add', bookDetails, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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
        setImageError(false);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add book to your collection.');
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
          <Typography variant="body1" paragraph>
            Effortlessly manage your book collection, explore insightful statistics, and much more.
          </Typography>
          <Typography variant="body1" paragraph>
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
        <Typography variant="h5" gutterBottom color="primary" textAlign="center">
          Add a New Book
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
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
            </Box>
          </Grid2>
        </Grid2>

        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            size="large"
            sx={{ 
              width: { xs: '100%', sm: '60%' },
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            Add to Collection
          </Button>
        </Box>

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
