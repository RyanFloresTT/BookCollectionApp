import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Paper,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  InputAdornment,
  Rating,
  Collapse,
  Button,
  Grid2,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useAuth0 } from '@auth0/auth0-react';
import DeleteBookCard from '../../components/BookCard/DeleteBookCard';
import { Book } from '../../types/book';
import api from '../../services/api';
import { genres } from '../../components/ManualBookEntry/genres';

const Collection: React.FC = () => {
const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [pageCountRange, setPageCountRange] = useState<number[]>([0, 2000]);

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await api.get('/books/collection', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Ensure we have an array of books
        const booksData = Array.isArray(response.data.books) ? response.data.books : [];
        setBooks(booksData);
        setFilteredBooks(booksData);
      } catch (error) {
        console.error('Error fetching books:', error);
        setBooks([]);
        setFilteredBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [getAccessTokenSilently]);

  // Apply filters
  useEffect(() => {
    if (!Array.isArray(books)) {
      console.error('Books data is not an array:', books);
      setFilteredBooks([]);
      return;
    }

    let result = [...books];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(book => 
        book?.title?.toLowerCase().includes(query) ||
        book?.author?.toLowerCase().includes(query)
      );
    }

    // Genre filter
    if (selectedGenres.length > 0) {
      result = result.filter(book => book?.genre && selectedGenres.includes(book.genre));
    }

    // Rating filter
    if (ratingFilter > 0) {
      result = result.filter(book => (book?.rating || 0) >= ratingFilter);
    }

    // Page count filter
    result = result.filter(book => 
      (book?.page_count || 0) >= pageCountRange[0] && 
      (book?.page_count || 0) <= pageCountRange[1]
    );

    setFilteredBooks(result);
  }, [books, searchQuery, selectedGenres, ratingFilter, pageCountRange]);

  const handleGenreChange = (event: any) => {
    const value = event.target.value;
    setSelectedGenres(typeof value === 'string' ? value.split(',') : value);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGenres([]);
    setRatingFilter(0);
    setPageCountRange([0, 2000]);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Your Collection
          </Typography>
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            color="primary"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </Box>

        {/* Search and Filters */}
        <Paper sx={{ mb: 4, p: 2 }}>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or author..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid2>

            <Collapse in={showFilters} sx={{ width: '100%' }}>
              <Grid2 container spacing={2} sx={{ mt: 1 }}>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Genres</InputLabel>
                    <Select
                      multiple
                      value={selectedGenres}
                      onChange={handleGenreChange}
                      label="Genres"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {genres.map((genre) => (
                        <MenuItem key={genre} value={genre}>
                          {genre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 4 }}>
                  <Box sx={{ px: 2 }}>
                    <Typography gutterBottom>Minimum Rating</Typography>
                    <Rating
                      value={ratingFilter}
                      onChange={(_, newValue) => setRatingFilter(newValue || 0)}
                      precision={0.5}
                    />
                  </Box>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 4 }}>
                  <Box sx={{ px: 2 }}>
                    <Typography gutterBottom>Page Count Range</Typography>
                    <Slider
                      value={pageCountRange}
                      onChange={(_, newValue) => setPageCountRange(newValue as number[])}
                      valueLabelDisplay="auto"
                      min={0}
                      max={2000}
                      step={50}
                    />
                  </Box>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={handleClearFilters}
                      startIcon={<ClearIcon />}
                    >
                      Clear Filters
                    </Button>
                  </Box>
                </Grid2>
              </Grid2>
            </Collapse>
          </Grid2>
        </Paper>

        {/* Results count */}
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Showing {filteredBooks.length} of {books.length} books
        </Typography>

        {/* Book Grid */}
        <Grid2 container spacing={3}>
          {filteredBooks.map((book) => (
            <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={book.ID}>
              <DeleteBookCard 
                book={book} 
                onDeleteSuccess={() => {
                  setBooks(books.filter(b => b.ID !== book.ID));
                }} 
              />
            </Grid2>
          ))}
        </Grid2>

        {/* Empty state */}
        {filteredBooks.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No books found matching your criteria
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Collection; 