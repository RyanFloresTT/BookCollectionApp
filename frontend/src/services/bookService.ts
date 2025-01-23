import api from './api';
import { Book } from '../types/book';

export const fetchRecentlyDeletedBooks = async (): Promise<Book[]> => {
  try {
    const response = await api.get('/books/recently-deleted');
    console.log('API Response:', response);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const restoreBook = async (bookId: number) => {
  await api.put(`/books/${bookId}/restore`);
};

export const fetchBooks = async (getAccessTokenSilently: () => Promise<string>) => {
  try {
    const token = await getAccessTokenSilently();
    const response = await api.get('/books/collection');
    const booksData: Book[] = Array.isArray(response.data.books) ? response.data.books : [];
    return booksData;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
};

