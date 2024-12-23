import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Snackbar,
  Typography,
  Paper,
  Rating,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../../services/api';

const ManualBookEntry: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [bookDetails, setBookDetails] = useState({
    title: '',
    author: '',
    description: '',
    coverImage: '',
    rating: 0,
    pageCount: 0,
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
          description: '',
          coverImage: '',
          rating: 0,
          pageCount: 0,
        });
      }
    } catch (error) {
      setError('Failed to add book to your collection.');
    }
  };

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
          label="Description"
          name="description"
          value={bookDetails.description}
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
        <Box component="fieldset" mb={3} borderColor="transparent">
          <Typography component="legend">Rating</Typography>
          <Rating
            name="rating"
            value={bookDetails.rating}
            precision={0.5}
            onChange={handleRatingChange}
          />
        </Box>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Add Book
        </Button>
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
