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
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../../services/api';

const genres = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Thriller',
  'Romance',
  'Horror',
  'Biography',
  'History',
  'Self-Help',
  'Health',
  'Travel',
  'Guide',
  'Religion',
  'Science',
  'Math',
  'Poetry',
  'Comics',
  'Art',
  'Cookbooks',
  'Diaries',
  'Journals',
  'Series',
  'Trilogy',
  'Anthology',
];

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setBookDetails((prevDetails) => ({
      ...prevDetails,
      [name]: name === 'pageCount' ? Math.max(0, Number(value)) : value,
    }));
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

  const handleSubmit = async () => {
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
      }
    } catch (error) {
      setError('Failed to add book to your collection.');
    }
  };

  if (!isAuthenticated) {
    return (
      <Paper>
        <Box p={2}>
          <Typography variant="h6">Welcome to BookCollectionApp!</Typography>
          <Typography variant="body1" component="p">
            Effortlessly manage your book collection, explore insightful statistics, and much more.
          </Typography>
          <Typography variant="body1" component="p">
            Support us to unlock advanced features like detailed stats and weekly, monthly, or yearly summaries.
          </Typography>
          <Typography variant="body1" component="p">
            Log in now to start organizing and enhancing your reading journey!
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper>
      <Box p={2}>
        <Typography variant="h6">Add a New Book</Typography>
        <TextField
          label="Title"
          name="title"
          value={bookDetails.title}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Author"
          name="author"
          value={bookDetails.author}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Cover Image URL"
          name="coverImage"
          value={bookDetails.coverImage}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Page Count"
          name="pageCount"
          type="number"
          value={bookDetails.pageCount}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          inputProps={{ min: 0 }}
        />
        <FormControl fullWidth margin="normal">
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
        <Box component="fieldset" mb={3} borderColor="transparent">
          <Typography component="legend">Rating</Typography>
          <Rating
            name="rating"
            value={bookDetails.rating}
            precision={0.5}
            onChange={handleRatingChange}
          />
        </Box>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ width: '80%' }}
          >
            Add Book
          </Button>
        </Box>
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
          message={success}
        />
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          message={error}
        />
      </Box>
    </Paper>
  );
};

export default ManualBookEntry;
