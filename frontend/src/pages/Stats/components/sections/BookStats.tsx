import React from 'react';
import Grid2 from '@mui/material/Grid2';
import { StatCard } from '../../../../components/Stats/StatCard';
import { FeatureSection } from '../../../../components/Stats/FeatureSection';
import { Book } from '../../../../types/Book';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HeightIcon from '@mui/icons-material/Height';
import CompressIcon from '@mui/icons-material/Compress';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface BookStatsProps {
  books: Book[];
}

export const BookStats: React.FC<BookStatsProps> = ({ books }) => {
  // Get completed books
  const completedBooks = React.useMemo(() => {
    return books
      .filter(book => book.finished_at)
      .sort((a, b) => new Date(b.finished_at!).getTime() - new Date(a.finished_at!).getTime());
  }, [books]);

  // Calculate average pages per book (only for books with page count)
  const averagePages = React.useMemo(() => {
    const booksWithPages = books.filter(book => book.page_count && book.page_count > 0);
    return booksWithPages.length > 0
      ? Math.round(booksWithPages.reduce((sum, book) => sum + (book.page_count || 0), 0) / booksWithPages.length)
      : 0;
  }, [books]);

  // Find longest book
  const longestBook = React.useMemo(() => {
    return books
      .filter(book => book.page_count && book.page_count > 0)
      .reduce((longest, book) => {
        return (book.page_count || 0) > (longest?.page_count || 0) ? book : longest;
      }, null as Book | null);
  }, [books]);

  // Find shortest book
  const shortestBook = React.useMemo(() => {
    return books
      .filter(book => book.page_count && book.page_count > 0)
      .reduce((shortest, book) => {
        if (!shortest || (book.page_count || 0) < (shortest.page_count || 0)) {
          return book;
        }
        return shortest;
      }, null as Book | null);
  }, [books]);

  // Calculate average time to complete a book (in days)
  // Only consider books completed in the last 6 months for more accurate recent reading patterns
  const averageCompletionTime = React.useMemo(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentCompletedBooks = completedBooks.filter(book => {
      if (!book.started_at || !book.finished_at) return false;
      const completedDate = new Date(book.finished_at);
      return completedDate >= sixMonthsAgo;
    });

    if (recentCompletedBooks.length === 0) return 0;

    const completionTimes = recentCompletedBooks.map(book => {
      const start = new Date(book.started_at!);
      const end = new Date(book.finished_at!);
      // Count only days where actual reading might have occurred
      return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    });

    return Math.round(completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length);
  }, [completedBooks]);

  return (
    <FeatureSection title="Book Stats" icon="📚">
      <Grid2 container spacing={3}>
        {/* Average Pages */}
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Average Pages"
            value={averagePages > 0 ? averagePages.toString() : 'No data'}
            subtitle="per book"
            icon={<MenuBookIcon />}
            color="#1565c0"
          />
        </Grid2>

        {/* Longest Book */}
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Longest Book"
            value={longestBook ? longestBook.page_count?.toString() || 'No data' : 'No data'}
            subtitle={longestBook ? longestBook.title : ''}
            icon={<HeightIcon />}
            color="#2e7d32"
          />
        </Grid2>

        {/* Shortest Book */}
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Shortest Book"
            value={shortestBook ? shortestBook.page_count?.toString() || 'No data' : 'No data'}
            subtitle={shortestBook ? shortestBook.title : ''}
            icon={<CompressIcon />}
            color="#ed6c02"
          />
        </Grid2>

        {/* Average Completion Time */}
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Average Time"
            value={averageCompletionTime > 0 ? averageCompletionTime.toString() : 'No data'}
            subtitle="days to complete"
            icon={<AccessTimeIcon />}
            color="#7b1fa2"
          />
        </Grid2>
      </Grid2>
    </FeatureSection>
  );
}; 