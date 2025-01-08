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

