import { useMemo } from 'react';
import { Book } from '../types/Book';

interface BasicStats {
  totalBooks: number;
  totalPages: number;
  averageRating: number | null;
  mostCommonGenre: string;
}

export const useBasicStats = (books: Book[]): BasicStats => {
  return useMemo(() => {
    if (!books || books.length === 0) {
      return {
        totalBooks: 0,
        totalPages: 0,
        averageRating: null,
        mostCommonGenre: ''
      };
    }

    // Calculate total books
    const totalBooks = books.length;

    // Calculate total pages
    const totalPages = books.reduce((acc, book) => acc + (book.page_count || 0), 0);

    // Calculate average rating
    const totalRatings = books.reduce((acc, book) => acc + (book.rating || 0), 0);
    const averageRating = books.length > 0 ? totalRatings / books.length : null;

    // Calculate most common genre
    const genres = books.map((book) => book.genre || 'Unknown');
    const genreCounts = genres.reduce((acc: { [key: string]: number }, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    const mostCommonGenre = Object.entries(genreCounts).reduce((a, b) => 
      (a[1] > b[1] ? a : b))[0];

    return {
      totalBooks,
      totalPages,
      averageRating,
      mostCommonGenre
    };
  }, [books]);
}; 