import React, { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  Box, 
  Typography, 
  Snackbar, 
  Alert, 
  Container, 
  Paper,
  Fade,
  CircularProgress,
  InputBase,
  IconButton,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { styled } from '@mui/material/styles';
import api from '../../services/api';
import DeleteBookCard from '../../components/BookCard/DeleteBookCard';
import { Book } from '../../types/book';

const HeaderPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: theme.palette.primary.contrastText,
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'linear-gradient(60deg, rgba(255,255,255,0.1) 25%, transparent 25%)',
    backgroundSize: '20px 20px',
    zIndex: 1,
  }
}));

const SearchBar = styled(Paper)(({ theme }) => ({
  padding: '2px 4px',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  maxWidth: 400,
  marginBottom: theme.spacing(4),
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));

const BooksGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: theme.spacing(3),
  padding: theme.spacing(2),
  justifyItems: 'center',
}));

const CollectionPage: React.FC = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);
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
      const activeBooks = books.filter((book: Book) => !book.deleted_at);
      setBooks(activeBooks);
      setFilteredBooks(activeBooks);
    } catch (err) {
      console.error('Error fetching collection:', err);
      setError('Failed to load your book collection.');
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCollection();
    }
  }, [fetchCollection, isAuthenticated]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    
    const filtered = books.filter(book => 
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      (book.genre && book.genre.toLowerCase().includes(query))
    );
    setFilteredBooks(filtered);
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg">
        <HeaderPaper elevation={3}>
          <Typography variant="h5" gutterBottom>
            Welcome to Your Book Collection
          </Typography>
          <Typography variant="body1">
            Please log in to view and manage your books.
          </Typography>
        </HeaderPaper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Fade in timeout={800}>
        <Box>
          <HeaderPaper elevation={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <LocalLibraryIcon sx={{ fontSize: 40 }} />
              <Typography variant="h4" component="h1">
                Your Book Collection
              </Typography>
            </Box>
            <Typography variant="subtitle1">
              {books.length} {books.length === 1 ? 'book' : 'books'} in your library
            </Typography>
          </HeaderPaper>

          <SearchBar>
            <IconButton sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search by title, author, or genre..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </SearchBar>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredBooks.length > 0 ? (
            <Fade in timeout={500}>
              <BooksGrid>
                {filteredBooks.map((book) => (
                  <DeleteBookCard
                    key={book.ID}
                    book={book}
                    onDeleteSuccess={fetchCollection}
                  />
                ))}
              </BooksGrid>
            </Fade>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery ? 'No books match your search' : 'Your collection is empty'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Add some books to get started!'
                }
              </Typography>
            </Paper>
          )}
        </Box>
      </Fade>

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
    </Container>
  );
};

export default CollectionPage;
