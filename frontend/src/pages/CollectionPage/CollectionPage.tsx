import React, { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Typography, Snackbar } from '@mui/material';
import api from '../../services/api';
import DeleteBookCard from '../../components/BookCard/DeleteBookCard';
import { Book } from '../../types/book';


const CollectionPage: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);  
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCollection = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await api.get('/books/collection', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const books = response.data.books.map((book: Book) => ({
        ...book,
        id: book.ID,
      }));
      setBooks(books);
      setBooks(books.filter((book: Book) => !book.deleted_at));
    } catch (err) {
      console.error('Error fetching collection:', err);
      setError('Failed to load your book collection.');
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Book Collection
      </Typography>

      {books.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {books.map((book) => (
            <DeleteBookCard
              key={book.ID}
              book={book}
              onDeleteSuccess={fetchCollection}
            />
          ))}
        </Box>
      ) : (
        <Typography variant="body1">You have no books in your collection.</Typography>
      )}

      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          message={error}
        />
      )}
      {success && (
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
          message={success}
        />
      )}
    </Box>
  );
};

export default CollectionPage;
