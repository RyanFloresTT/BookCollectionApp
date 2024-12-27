import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  Paper,
  Alert,
  Grid2,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth0 } from '@auth0/auth0-react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import api from '../../services/api';
import { Book } from '../../types/book';
import { genres } from '../ManualBookEntry/genres';

interface DeleteBookCardProps {
  book: Book;
  onDeleteSuccess: () => void;
}

const CARD_WIDTH = 250;
const CARD_HEIGHT = 380;
const COVER_HEIGHT = 280;

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  margin: theme.spacing(2),
  transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
  transformStyle: 'preserve-3d',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
    borderRadius: theme.shape.borderRadius,
    opacity: 0,
    transition: 'opacity 0.1s ease-out',
    zIndex: -1,
  },
  '&:hover::after': {
    opacity: 1,
  },
}));

const CardInfo = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  height: CARD_HEIGHT - COVER_HEIGHT,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const DetailsPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const DeleteBookCard: React.FC<DeleteBookCardProps> = ({ book: initialBook, onDeleteSuccess }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [book, setBook] = useState<Book>(initialBook);
  const [startDate, setStartDate] = useState<Date | null>(book.started_at ? new Date(book.started_at) : null);
  const [finishDate, setFinishDate] = useState<Date | null>(book.finished_at ? new Date(book.finished_at) : null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDelete = async () => {
    try {
      const token = await getAccessTokenSilently();
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.delete(`/books/${book.ID}`);

      if (response.status === 200 || response.status === 204) {
        setSuccess('Book removed successfully');
        onDeleteSuccess();
        setIsDialogOpen(false);
      } else {
        setError('Failed to delete the book.');
      }
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('An error occurred while deleting the book.');
    }
  };

  const handleSave = async () => {
    try {
      const token = await getAccessTokenSilently();
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await api.patch(`/books/${book.ID}`, {
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        rating: book.rating,
        pageCount: book.page_count,
        genre: book.genre,
        started_at: startDate?.toISOString() || null,
        finished_at: finishDate?.toISOString() || null,
      });

      if (response.status === 200) {
        setSuccess('Book updated successfully');
        setIsEditing(false);
      } else {
        setError('Failed to update the book.');
      }
    } catch (err) {
      console.error('Error updating book:', err);
      setError('An error occurred while updating the book.');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = -(x - centerX) / 20;

    // Calculate shadow offset based on rotation
    const shadowX = (x - centerX) / 10;
    const shadowY = (y - centerY) / 10;
    const shadowBlur = 24 + Math.abs(shadowX + shadowY) / 2;
    const shadowSpread = 8 + Math.abs(shadowX + shadowY) / 4;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    card.style.boxShadow = `
      ${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px rgba(0,0,0,0.1),
      0 0 4px rgba(0,0,0,0.05)
    `;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    cardRef.current.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
  };

  return (
    <>
      <StyledCard 
        ref={cardRef}
        onClick={() => setIsDialogOpen(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <CardMedia
          sx={{
            height: COVER_HEIGHT,
            objectFit: 'cover',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
          image={book.coverImage || 'https://via.placeholder.com/200x300?text=No+Cover'}
          title={`${book.title} cover`}
        />
        <CardInfo>
          <Box>
            <Typography gutterBottom variant="h6" noWrap>
              {book.title}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" noWrap>
              {book.author}
            </Typography>
          </Box>
        </CardInfo>
      </StyledCard>

      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div">
            {book.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DetailsPaper elevation={0}>
            <Grid2 container spacing={3}>
              <Grid2 size={{ xs: 12, md: 4 }}>
                <Box
                  component="img"
                  src={book.coverImage || 'https://via.placeholder.com/200x300?text=No+Cover'}
                  alt={`${book.title} cover`}
                  sx={{
                    width: '100%',
                    maxHeight: '300px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {isEditing ? (
                    <>
                      <TextField
                        label="Title"
                        value={book.title}
                        onChange={(e) => setBook({ ...book, title: e.target.value })}
                        fullWidth
                      />
                      <TextField
                        label="Author"
                        value={book.author}
                        onChange={(e) => setBook({ ...book, author: e.target.value })}
                        fullWidth
                      />
                      <TextField
                        label="Cover Image URL"
                        value={book.coverImage}
                        onChange={(e) => setBook({ ...book, coverImage: e.target.value })}
                        fullWidth
                      />
                      <TextField
                        label="Page Count"
                        type="number"
                        value={book.page_count || 0}
                        onChange={(e) => setBook({ ...book, page_count: parseInt(e.target.value) || 0 })}
                        fullWidth
                        inputProps={{ min: 0 }}
                      />
                      <FormControl fullWidth>
                        <InputLabel>Genre</InputLabel>
                        <Select
                          value={book.genre || ''}
                          onChange={(e) => setBook({ ...book, genre: e.target.value })}
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
                        <Typography component="legend">Rating</Typography>
                        <Rating
                          value={book.rating || 0}
                          onChange={(_, newValue) => setBook({ ...book, rating: newValue || 0 })}
                          precision={0.5}
                        />
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6">
                        {book.title}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        by {book.author}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography component="legend">Rating:</Typography>
                        <Rating value={book.rating || 0} readOnly precision={0.5} />
                      </Box>
                      {book.genre && (
                        <Typography variant="body2" color="text.secondary">
                          Genre: {book.genre}
                        </Typography>
                      )}
                      {book.page_count && (
                        <Typography variant="body2" color="text.secondary">
                          Pages: {book.page_count}
                        </Typography>
                      )}
                    </>
                  )}

                  {/* Reading Progress Section */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Reading Progress
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Status: {finishDate ? "Completed" : (startDate ? "Currently Reading" : "Not Started")}
                      </Typography>
                    </Box>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <DatePicker
                          label="Started Reading"
                          value={startDate}
                          onChange={(newValue) => {
                            setStartDate(newValue);
                            if (!newValue) setFinishDate(null);
                          }}
                          disabled={!isEditing}
                          slots={{ textField: TextField }}
                          slotProps={{ 
                            textField: { 
                              fullWidth: true,
                              helperText: isEditing ? "Clear this field to mark as 'Not Started'" : undefined
                            }
                          }}
                        />
                        <DatePicker
                          label="Finished Reading"
                          value={finishDate}
                          onChange={(newValue) => setFinishDate(newValue)}
                          disabled={!isEditing || !startDate}
                          slots={{ textField: TextField }}
                          slotProps={{ 
                            textField: { 
                              fullWidth: true,
                              helperText: isEditing && startDate ? "Leave empty if still reading" : undefined
                            }
                          }}
                          minDate={startDate || undefined}
                        />
                      </Box>
                    </LocalizationProvider>
                  </Box>
                </Box>
              </Grid2>
            </Grid2>
          </DetailsPaper>
        </DialogContent>
        <DialogActions sx={{ padding: 2 }}>
          {!isEditing ? (
            <>
              <Button
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                variant="outlined"
                color="primary"
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                variant="contained"
                color="error"
              >
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outlined"
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                color="primary"
              >
                Save
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

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
    </>
  );
};

export default DeleteBookCard;
