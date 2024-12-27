import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import BookCard from './BookCard';
import api from '../../services/api';

// Mock API
jest.mock('../../services/api', () => ({
  delete: jest.fn(),
  defaults: {
    headers: {
      common: {}
    }
  }
}));

const mockBook = {
  ID: 1,
  title: 'Test Book',
  author: 'Test Author',
  genre: 'Fantasy',
  rating: 4.5,
  page_count: 300,
  coverImage: 'https://example.com/cover.jpg'
};

describe('BookCard Component', () => {
  const mockOnDeleteSuccess = jest.fn();
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    (api.delete as jest.Mock).mockResolvedValue({ status: 200 });
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}>
        <BookCard book={mockBook} onDeleteSuccess={mockOnDeleteSuccess} />
      </ThemeProvider>
    );
  };

  test('renders book information correctly', () => {
    renderComponent();

    expect(screen.getByText(mockBook.title)).toBeInTheDocument();
    expect(screen.getByText(mockBook.author)).toBeInTheDocument();
    
    // CardMedia uses image prop instead of src
    const cardMedia = screen.getByTitle(`${mockBook.title} cover`);
    expect(cardMedia).toHaveStyle({ backgroundImage: `url(${mockBook.coverImage})` });
  });

  test('opens dialog when clicked', async () => {
    renderComponent();

    // Click the card
    fireEvent.click(screen.getByText(mockBook.title));

    // Dialog should show more details
    await waitFor(() => {
      expect(screen.getByText(`by ${mockBook.author}`)).toBeInTheDocument();
      expect(screen.getByText(`Genre: ${mockBook.genre}`)).toBeInTheDocument();
      expect(screen.getByText(`Pages: ${mockBook.page_count}`)).toBeInTheDocument();
    });
  });

  test('handles delete action', async () => {
    renderComponent();

    // Open dialog
    fireEvent.click(screen.getByText(mockBook.title));

    // Click delete button
    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Verify API call and success callback
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(`/books/${mockBook.ID}`);
      expect(mockOnDeleteSuccess).toHaveBeenCalled();
    });

    // Verify success message
    expect(await screen.findByText('Book removed successfully')).toBeInTheDocument();
  });

  test('handles delete error', async () => {
    // Mock API error
    (api.delete as jest.Mock).mockRejectedValue(new Error('API Error'));
    renderComponent();

    // Open dialog
    fireEvent.click(screen.getByText(mockBook.title));

    // Click delete button
    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Verify error message
    expect(await screen.findByText('An error occurred while deleting the book.')).toBeInTheDocument();
  });

  test('shows placeholder image when no cover image provided', () => {
    const bookWithoutCover = { ...mockBook, coverImage: undefined };
    render(
      <ThemeProvider theme={theme}>
        <BookCard book={bookWithoutCover} onDeleteSuccess={mockOnDeleteSuccess} />
      </ThemeProvider>
    );

    // CardMedia uses image prop instead of src
    const cardMedia = screen.getByTitle(`${mockBook.title} cover`);
    expect(cardMedia).toHaveStyle({ backgroundImage: 'url(https://via.placeholder.com/200x300?text=No+Cover)' });
  });
}); 