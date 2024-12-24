import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth0 } from '@auth0/auth0-react';
import { Book } from '../../types/book';

interface BookCardProps {
  book: Book;
  onAdd: (book: Book) => void;
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

const BookCard: React.FC<BookCardProps> = ({ book, onAdd }) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  const handleAdd = () => {
    if (isAuthenticated) {
      onAdd(book);
    } else {
      loginWithRedirect();
    }
  };

  return (
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
      </CardContent>
      <Overlay>
        <Typography variant="h6">{book.title}</Typography>
        <Typography variant="subtitle2">{book.author}</Typography>
        {book.rating && (
          <Typography variant="body2">Rating: {book.rating}</Typography>
        )}
        <Button variant="contained" color="primary" onClick={handleAdd}>
          {isAuthenticated ? 'Add to Collection' : 'Login to Add'}
        </Button>
      </Overlay>
    </StyledCard>
  );
};

export default BookCard;
