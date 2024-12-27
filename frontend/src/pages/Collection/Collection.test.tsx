import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import Collection from './Collection';
import api from '../../services/api';

// Mock API
jest.mock('../../services/api', () => ({
  get: jest.fn(),
  defaults: {
    headers: {
      common: {}
    }
  }
}));

describe('Collection Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup API mock response
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        books: [
          { ID: 1, title: 'Harry Potter', author: 'J.K. Rowling', genre: 'Fantasy', rating: 4.5, page_count: 300 },
          { ID: 2, title: '1984', author: 'George Orwell', genre: 'Science Fiction', rating: 5, page_count: 400 },
        ]
      }
    });

    // Debug: Log when beforeEach runs
    console.log('beforeEach: Fresh component and mocks');
  });

  afterEach(() => {
    // Debug: Log when cleanup happens
    console.log('afterEach: Cleaning up');
  });

  const renderComponent = () => {
    const result = render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Collection />
        </BrowserRouter>
      </ThemeProvider>
    );
    // Debug: Log when component is rendered
    console.log('Component rendered');
    return result;
  };

  test('displays books after loading', async () => {
    renderComponent();

    // Wait for the API call to be made
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/books/collection', expect.any(Object));
    });

    // Wait for books to appear and verify they're displayed
    await waitFor(() => {
      expect(screen.getByText('Harry Potter')).toBeInTheDocument();
      expect(screen.getByText('1984')).toBeInTheDocument();
    });
  });

  test('filters books by search query', async () => {
    renderComponent();

    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByText('Harry Potter')).toBeInTheDocument();
    });

    // Find and use the search input
    const searchInput = screen.getByPlaceholderText('Search by title or author...');
    fireEvent.change(searchInput, { target: { value: 'Harry' } });

    // Verify filtered results
    expect(screen.getByText('Harry Potter')).toBeInTheDocument();
    expect(screen.queryByText('1984')).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('1984')).toBeInTheDocument();
  });

  test('filters books by genre', async () => {
    renderComponent();

    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByText('Harry Potter')).toBeInTheDocument();
    });

    // Open filters
    fireEvent.click(screen.getByRole('button', { name: /show filters/i }));

    // Find and click the genre combobox
    const combobox = await waitFor(() => screen.getByRole('combobox'));
    fireEvent.mouseDown(combobox);

    // Wait for listbox to be visible and select Fantasy
    const listbox = await screen.findByRole('listbox');
    const fantasyOption = within(listbox).getByText(/fantasy/i);
    fireEvent.click(fantasyOption);

    // Verify filtered results
    await waitFor(() => {
      expect(screen.getByText('Harry Potter')).toBeInTheDocument();
      expect(screen.queryByText('1984')).not.toBeInTheDocument();
    });
  });

  test('filters books by minimum rating', async () => {
    renderComponent();

    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByText('Harry Potter')).toBeInTheDocument();
    });

    // Open filters
    fireEvent.click(screen.getByRole('button', { name: /show filters/i }));

    // Find the rating component
    const ratingLabel = await waitFor(() => screen.getByText('Minimum Rating'));
    
    // Find the 5-star radio input by its value
    const fiveStarInput = screen.getByRole('radio', { name: '5 Stars' });
    fireEvent.click(fiveStarInput);

    // Wait for filter to be applied
    await waitFor(() => {
      expect(screen.queryByText('Harry Potter')).not.toBeInTheDocument();
      expect(screen.getByText('1984')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('clears all filters when reset button is clicked', async () => {
    renderComponent();

    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByText('Harry Potter')).toBeInTheDocument();
    });

    // Open filters
    fireEvent.click(screen.getByText('Show Filters'));

    // Apply search filter
    const searchInput = screen.getByPlaceholderText('Search by title or author...');
    fireEvent.change(searchInput, { target: { value: 'Harry' } });

    // Verify filter is applied
    expect(screen.getByText('Harry Potter')).toBeInTheDocument();
    expect(screen.queryByText('1984')).not.toBeInTheDocument();

    // Clear filters
    fireEvent.click(screen.getByText('Clear Filters'));

    // Verify all books are shown
    expect(screen.getByText('Harry Potter')).toBeInTheDocument();
    expect(screen.getByText('1984')).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });

  test('shows correct results count', async () => {
    renderComponent();

    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByText('Harry Potter')).toBeInTheDocument();
    });

    // Check initial count
    expect(screen.getByText('Showing 2 of 2 books')).toBeInTheDocument();

    // Apply search filter
    const searchInput = screen.getByPlaceholderText('Search by title or author...');
    fireEvent.change(searchInput, { target: { value: 'Harry' } });

    // Check updated count
    expect(screen.getByText('Showing 1 of 2 books')).toBeInTheDocument();
  });

  test('filters books by page count range', async () => {
    renderComponent();

    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByText('Harry Potter')).toBeInTheDocument();
    });

    // Open filters
    fireEvent.click(screen.getByRole('button', { name: /show filters/i }));

    // Find the page count slider inputs
    const sliderInputs = screen.getAllByRole('slider');
    const minInput = sliderInputs[0];  // First input is min
    const maxInput = sliderInputs[1];  // Second input is max

    // Set range to 350-450 pages (should only show 1984 which has 400 pages)
    fireEvent.change(minInput, { target: { value: 350 } });
    fireEvent.change(maxInput, { target: { value: 450 } });

    // Verify filtered results
    await waitFor(() => {
      expect(screen.queryByText('Harry Potter')).not.toBeInTheDocument(); // 300 pages
      expect(screen.getByText('1984')).toBeInTheDocument(); // 400 pages
    });

    // Reset to show all books
    fireEvent.change(minInput, { target: { value: 0 } });
    fireEvent.change(maxInput, { target: { value: 2000 } });

    // Verify all books are shown
    await waitFor(() => {
      expect(screen.getByText('Harry Potter')).toBeInTheDocument();
      expect(screen.getByText('1984')).toBeInTheDocument();
    });
  });
});