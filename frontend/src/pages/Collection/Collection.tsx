import React, { useState, useEffect, useMemo } from 'react';
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
  Pagination,
  Grid2,
  Fab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useAuth0 } from '@auth0/auth0-react';
import BookCard from '../../components/BookCard/BookCard';
import { Book } from '../../types/book';
import api from '../../services/api';
import { genres } from '../../components/ManualBookEntry/genres';
import RecentlyDeleted from '../../components/RecentlyDeleted/RecentlyDeleted';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const Collection: React.FC = () => {
const { getAccessTokenSilently } = useAuth0();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const BOOKS_PER_PAGE = 8;
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [maxPageCount, setMaxPageCount] = useState<number>(2000);
  const [pageCountRange, setPageCountRange] = useState<number[]>([0, 2000]);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);

  // Filter books using useMemo
  const filteredBooks = useMemo(() => {
    if (!Array.isArray(books)) {
      console.error('Books data is not an array:', books);
      return [];
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
    result = result.filter(book => {
      const pageCount = book?.page_count;
      // If page_count is null or undefined, keep the book
      if (pageCount === null || pageCount === undefined) {
        return true;
      }
      return pageCount >= pageCountRange[0] && pageCount <= pageCountRange[1];
    });

    return result;
  }, [books, searchQuery, selectedGenres, ratingFilter, pageCountRange]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);
  const startIndex = (page - 1) * BOOKS_PER_PAGE;
  const displayedBooks = filteredBooks.slice(startIndex, startIndex + BOOKS_PER_PAGE);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedGenres, ratingFilter, pageCountRange]);

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await api.get('/books/collection');
        
        // Ensure we have an array of books
        const booksData: Book[] = Array.isArray(response.data.books) ? response.data.books : [];

        // Calculate max page count
        const maxPages = Math.max(
          2000, // minimum default
          ...booksData.map(book => book.page_count || 0)
        );
        setMaxPageCount(maxPages);
        setPageCountRange([0, maxPages]); // Update the range to include all books
        setBooks(booksData);
      } catch (error) {
        console.error('Error fetching books:', error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [getAccessTokenSilently]);

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

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll to top of the page when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Your Collection
          </Typography>
          {books.length > 0 && (
            <Button
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              color="primary"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          )}
        </Box>

        {books.length > 0 && (
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
                  <Grid2 size={{xs: 12, md: 4}}>
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

                  <Grid2 size={{xs: 12, md: 4}}>
                    <Box sx={{ px: 2 }}>
                      <Typography gutterBottom>Minimum Rating</Typography>
                      <Rating
                        value={ratingFilter}
                        onChange={(_, newValue) => setRatingFilter(newValue || 0)}
                        precision={0.5}
                      />
                    </Box>
                  </Grid2>

                  <Grid2 size={{xs: 12, md: 4}}>
                    <Box sx={{ px: 2 }}>
                      <Typography gutterBottom>Page Count Range</Typography>
                      <Slider
                        value={pageCountRange}
                        onChange={(_, newValue) => setPageCountRange(newValue as number[])}
                        valueLabelDisplay="auto"
                        min={0}
                        max={maxPageCount}
                        step={50}
                      />
                    </Box>
                  </Grid2>

                  <Grid2 size={{xs: 12}}>
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
        )}

        {/* Results count */}
        {books.length > 0 && (
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Showing {startIndex + 1}-{Math.min(startIndex + BOOKS_PER_PAGE, filteredBooks.length)} of {filteredBooks.length} books
          </Typography>
        )}

        {/* Book Grid */}
        <Grid2 container spacing={3} sx={{ mb: 4 }}>
          {displayedBooks.map((book) => (
            <Grid2 size={{xs: 12, sm: 6, md: 4, lg: 3}} key={book.ID}>
              <BookCard 
                book={book} 
                onDeleteSuccess={() => {
                  setBooks(books.filter(b => b.ID !== book.ID));
                }} 
              />
            </Grid2>
          ))}
        </Grid2>

        <Fab
          variant="extended"
          color="primary"
          onClick={() => setIsDeletedModalOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
          }}
        >
          <DeleteOutlineIcon sx={{ mr: 1 }} />
          Recently Deleted
        </Fab>

        <RecentlyDeleted 
          isOpen={isDeletedModalOpen} 
          onClose={() => setIsDeletedModalOpen(false)} 
        />

        {/* Pagination - show only if there's more than one page */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <Pagination 
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                },
              }}
            />
          </Box>
        )}

        {/* Empty state */}
        {filteredBooks.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {books.length === 0 ? (
                <>
                  Your collection is empty
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    Start by adding some books to your collection!
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    href="/"
                    sx={{ mt: 2 }}
                  >
                    Add Your First Book
                  </Button>
                </>
              ) : (
                'No books found matching your criteria'
              )}
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Collection; 