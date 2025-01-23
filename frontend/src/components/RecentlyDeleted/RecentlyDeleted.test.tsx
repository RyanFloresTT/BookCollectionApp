import { render, screen, fireEvent, within } from '@testing-library/react';
import RecentlyDeleted from './RecentlyDeleted';
import { fetchRecentlyDeletedBooks, restoreBook } from '../../services/bookService';
import { Book } from '../../types/book';

jest.mock('../../services/bookService');

const mockBooks: Book[] = [
  { ID: 1, title: 'Book 1', author: 'Author 1', deleted_at: '2023-09-01' },
  { ID: 2, title: 'Book 2', author: 'Author 2', deleted_at: '2023-09-02' },
];

describe('RecentlyDeleted Component', () => {
  beforeEach(() => {
    (fetchRecentlyDeletedBooks as jest.Mock).mockResolvedValue(mockBooks);
    (restoreBook as jest.Mock).mockResolvedValue({});
  });

  test('fetches and displays recently deleted books', async () => {
    render(<RecentlyDeleted isOpen={true} onClose={jest.fn()} onBookRestored={jest.fn()} />);

    expect(await screen.findByText('Book 1')).toBeInTheDocument();
    expect(screen.getByText('Book 2')).toBeInTheDocument();
  });
});