import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../../services/api'
import { Book } from '../../types/book';

interface DeleteBookCardProps {
  book: Book;
  onDeleteSuccess: () => void;
}

const Overlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: 0,
  transition: 'opacity 0.3s',
  '&:hover': {
    opacity: 1,
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  maxWidth: 345,
  margin: theme.spacing(2),
  '&:hover': {
    cursor: 'pointer',
  },
}));

const DeleteBookCard: React.FC<DeleteBookCardProps> = ({ book, onDeleteSuccess }) => {
  console.log("DeleteBookCard received book:", book);
  console.log("Book ID Received:", book.ID);
  const bookId = book.ID; 
  const { getAccessTokenSilently } = useAuth0();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleDelete = async () => {
    try {
      const token = await getAccessTokenSilently();
  
      // Set the Authorization header for the Axios instance
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
      console.log(bookId);

      // Make the DELETE request
      const response = await api.delete(`/books/${bookId}`);
  
      if (response.status === 200 || response.status === 204) {
        setSuccess('Book removed successfully');
        onDeleteSuccess(); // Reload or fetch the updated collection
      } else {
        console.error('Error deleting book:', response.data);
        setError('Failed to delete the book.');
      }
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('An error occurred while deleting the book.');
    }
  };
  
  return (
    <>
      <StyledCard>
        {book.coverImage && (
          <CardMedia
            component="img"
            height="200"
            image={book.coverImage}
            alt={`${book.title} cover`}
          />
        )}
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            {book.title}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {book.author}
          </Typography>
          {book.description && (
            <Typography variant="body2" color="text.secondary">
              {book.description.length > 100
                ? `${book.description.substring(0, 100)}...`
                : book.description}
            </Typography>
          )}
        </CardContent>
        <Overlay>
          <IconButton onClick={handleDelete} color="secondary">
            <DeleteIcon />
          </IconButton>
        </Overlay>
      </StyledCard>
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
    </>
  );
};

export default DeleteBookCard;
