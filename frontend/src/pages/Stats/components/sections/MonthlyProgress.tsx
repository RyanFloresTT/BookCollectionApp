import React from 'react';
import Grid2 from '@mui/material/Grid2';
import { StatCard } from '../../../../components/Stats/StatCard';
import { FeatureSection } from '../../../../components/Stats/FeatureSection';
import { Book } from '../../../../types/Book';

interface MonthlyProgressProps {
  books: Book[];
}

export const MonthlyProgress: React.FC<MonthlyProgressProps> = ({ books }) => {
  const currentMonth = new Date().getMonth();

  // Calculate books completed per month
  const booksCompletedByMonth = React.useMemo(() => {
    const monthCounts = new Array(12).fill(0);
    books.forEach(book => {
      if (!book.finished_at) return;
      const completedDate = new Date(book.finished_at);
      if (completedDate.getFullYear() === new Date().getFullYear()) {
        monthCounts[completedDate.getMonth()]++;
      }
    });
    return monthCounts;
  }, [books]);

  // Calculate books started per month
  const booksStartedByMonth = React.useMemo(() => {
    const monthCounts = new Array(12).fill(0);
    books.forEach(book => {
      if (!book.started_at) return;
      const startedDate = new Date(book.started_at);
      if (startedDate.getFullYear() === new Date().getFullYear()) {
        monthCounts[startedDate.getMonth()]++;
      }
    });
    return monthCounts;
  }, [books]);

  // Calculate average rating per month
  const averageRatingByMonth = React.useMemo(() => {
    const monthRatings: { sum: number; count: number }[] = Array(12).fill(null).map(() => ({ sum: 0, count: 0 }));
    books.forEach(book => {
      if (!book.finished_at || !book.rating) return;
      const completedDate = new Date(book.finished_at);
      if (completedDate.getFullYear() === new Date().getFullYear()) {
        monthRatings[completedDate.getMonth()].sum += book.rating;
        monthRatings[completedDate.getMonth()].count++;
      }
    });
    return monthRatings.map(({ sum, count }) => count > 0 ? sum / count : 0);
  }, [books]);

  // Calculate pages read per month
  const pagesReadByMonth = React.useMemo(() => {
    const monthPages = new Array(12).fill(0);
    books.forEach(book => {
      if (!book.finished_at || !book.page_count) return;
      const completedDate = new Date(book.finished_at);
      if (completedDate.getFullYear() === new Date().getFullYear()) {
        monthPages[completedDate.getMonth()] += book.page_count;
      }
    });
    return monthPages;
  }, [books]);

  return (
    <FeatureSection title="Monthly Progress" icon="📈">
      <Grid2 container spacing={3}>
        {/* Books Read */}
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Books Read"
            value={booksCompletedByMonth[currentMonth].toString()}
            subtitle="this month"
          />
        </Grid2>

        {/* Pages Read */}
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pages Read"
            value={pagesReadByMonth[currentMonth].toString()}
            subtitle="this month"
          />
        </Grid2>

        {/* Average Rating */}
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Average Rating"
            value={averageRatingByMonth[currentMonth].toFixed(1)}
            subtitle="this month"
          />
        </Grid2>

        {/* Completion Rate */}
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Completion Rate"
            value={`${booksStartedByMonth[currentMonth] > 0 
              ? Math.round((booksCompletedByMonth[currentMonth] / booksStartedByMonth[currentMonth]) * 100) 
              : 0}%`}
            subtitle="this month"
          />
        </Grid2>
      </Grid2>
    </FeatureSection>
  );
}; 