import { Dialog, DialogTitle, DialogContent, IconButton, List, ListItem, ListItemText, Button, Typography } from '@mui/material';
import { Close as CloseIcon, RestoreFromTrash as RestoreIcon } from '@mui/icons-material';
import { Book } from '../../types/book';
import { fetchRecentlyDeletedBooks, restoreBook } from '../../services/bookService';
import { useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const RecentlyDeleted: React.FC<Props> = ({ isOpen, onClose }) => {
  const [recentlyDeletedBooks, setRecentlyDeletedBooks] = useState<Book[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        console.log('Fetching deleted books...');
        const books = await fetchRecentlyDeletedBooks();
        console.log('Received books:', books);
        setRecentlyDeletedBooks(books);
      } catch (error) {
        console.error('Failed to fetch deleted books:', error);
        setRecentlyDeletedBooks([]);
      }
    };

    if (isOpen) {
      fetchBooks();
    }
  }, [isOpen]);

  const handleRestore = async (bookId: number) => {
    try {
      await restoreBook(bookId);
      setRecentlyDeletedBooks(books => books.filter(book => book.ID !== bookId));
    } catch (error) {
      console.error('Failed to restore book:', error);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Recently Deleted Books
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {recentlyDeletedBooks.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={4}>
            No recently deleted books
          </Typography>
        ) : (
          <List>
            {recentlyDeletedBooks.map((book: Book) => (
              <ListItem
                key={book.ID}
                secondaryAction={
                  <Button
                    startIcon={<RestoreIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => handleRestore(book.ID)}
                  >
                    Restore
                  </Button>
                }
              >
                <ListItemText
                  primary={book.title}
                  secondary={`Deleted on ${book.deleted_at}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecentlyDeleted;