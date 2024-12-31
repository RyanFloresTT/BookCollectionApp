import React from 'react';
import Grid2 from '@mui/material/Grid2';
import { StatCard } from '../../../../components/Stats/StatCard';
import { FeatureSection } from '../../../../components/Stats/FeatureSection';
import { Book } from '../../../../types/Book';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface KeyStatsProps {
  books: Book[];
}

export const KeyStats: React.FC<KeyStatsProps> = ({ books }) => {
  // Get completed books sorted by completion date
  const completedBooks = React.useMemo(() => {
    return books
      .filter(book => book.finished_at)
      .sort((a, b) => new Date(b.finished_at!).getTime() - new Date(a.finished_at!).getTime());
  }, [books]);

  // Calculate current streak based on continuous reading activity
  const currentStreak = React.useMemo(() => {
    // Get all reading periods
    const readingPeriods = books
      .filter(book => book.started_at)
      .map(book => {
        const start = new Date(book.started_at!);
        const end = book.finished_at ? new Date(book.finished_at) : new Date();
        return { start, end };
      })
      .sort((a, b) => b.end.getTime() - a.end.getTime()); // Sort by end date, most recent first

    if (readingPeriods.length === 0) return 0;

    // Check if there's been any reading activity in the last week
    const mostRecentDate = readingPeriods[0].end;
    const daysSinceLastActivity = Math.floor((new Date().getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastActivity > 7) return 0;

    // Find the most recent continuous reading streak
    let streakEndDate = new Date();
    let streakStartDate = new Date(streakEndDate);
    let hasActiveDay = false;

    // Check each day going backwards
    while (true) {
      // Check if this day had any reading activity
      hasActiveDay = false;
      for (const period of readingPeriods) {
        if (streakStartDate >= period.start && streakStartDate <= period.end) {
          hasActiveDay = true;
          break;
        }
      }

      if (!hasActiveDay) break;

      // Move to previous day
      streakStartDate.setDate(streakStartDate.getDate() - 1);
    }

    // Add one day back since we went one day too far back
    streakStartDate.setDate(streakStartDate.getDate() + 1);

    // Calculate streak length
    const streakDays = Math.floor((streakEndDate.getTime() - streakStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return streakDays;
  }, [books]);

  // Calculate reading speed (pages per day) - use last 30 days
  const readingSpeed = React.useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBooks = completedBooks.filter(book => {
      const completedDate = new Date(book.finished_at!);
      return completedDate >= thirtyDaysAgo && book.page_count && book.page_count > 0;
    });

    if (recentBooks.length === 0) return 0;

    const totalPages = recentBooks.reduce((sum, book) => sum + (book.page_count || 0), 0);
    const totalDays = Math.max(1, Math.min(30, recentBooks.length * 7)); // Assume at least 1 day, at most 30 days
    return Math.round(totalPages / totalDays);
  }, [completedBooks]);

  // Calculate completion rate (last 6 months)
  const completionRate = React.useMemo(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentBooks = books.filter(book => {
      if (!book.started_at) return false;
      const startDate = new Date(book.started_at);
      return startDate >= sixMonthsAgo;
    });

    const startedCount = recentBooks.length;
    const completedCount = recentBooks.filter(book => book.finished_at).length;

    return startedCount > 0 ? Math.round((completedCount / startedCount) * 100) : 0;
  }, [books]);

  // Calculate longest streak
  const longestStreak = React.useMemo(() => {
    const readingPeriods = books
      .filter(book => book.started_at)
      .map(book => {
        const start = new Date(book.started_at!);
        const end = book.finished_at ? new Date(book.finished_at) : new Date();
        return { start, end };
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    if (readingPeriods.length === 0) return 0;

    let maxStreak = 0;
    let currentStreak = 0;
    let currentDate = new Date(readingPeriods[0].start);
    const lastDate = new Date(readingPeriods[readingPeriods.length - 1].end);

    while (currentDate <= lastDate) {
      let hasActiveBook = false;
      for (const period of readingPeriods) {
        if (currentDate >= period.start && currentDate <= period.end) {
          hasActiveBook = true;
          break;
        }
      }

      if (hasActiveBook) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return maxStreak;
  }, [books]);

  // Calculate average reading time per day
  const averageReadingTime = React.useMemo(() => {
    const completedWithDates = completedBooks.filter(book => book.started_at);
    if (completedWithDates.length === 0) return 0;

    const totalReadingDays = completedWithDates.reduce((sum, book) => {
      const start = new Date(book.started_at!);
      const end = new Date(book.finished_at!);
      return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);

    return Math.round(totalReadingDays / completedWithDates.length);
  }, [completedBooks]);

  return (
    <FeatureSection title="Key Stats" icon="📊">
      <Grid2 container spacing={3}>
        {/* Current Streak */}
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Current Streak"
            value={currentStreak > 0 ? currentStreak.toString() : 'No streak'}
            subtitle="days reading"
            icon={<LocalFireDepartmentIcon />}
            color="#f44336"
          />
        </Grid2>

        {/* Longest Streak */}
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Longest Streak"
            value={longestStreak > 0 ? longestStreak.toString() : 'No data'}
            subtitle="consecutive days"
            icon={<TrendingUpIcon />}
            color="#2e7d32"
          />
        </Grid2>

        {/* Reading Speed */}
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Reading Speed"
            value={readingSpeed > 0 ? readingSpeed.toString() : 'No data'}
            subtitle="pages per day"
            icon={<SpeedIcon />}
            color="#1565c0"
          />
        </Grid2>

        {/* Completion Rate */}
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Completion Rate"
            value={completionRate > 0 ? `${completionRate}%` : 'No data'}
            subtitle="of started books"
            icon={<CheckCircleIcon />}
            color="#7b1fa2"
          />
        </Grid2>

        {/* Books in Progress */}
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Currently Reading"
            value={books.filter(book => book.started_at && !book.finished_at).length.toString()}
            subtitle="books in progress"
            icon={<MenuBookIcon />}
            color="#ed6c02"
          />
        </Grid2>

        {/* Average Reading Time */}
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Average Time"
            value={averageReadingTime > 0 ? averageReadingTime.toString() : 'No data'}
            subtitle="days per book"
            icon={<AccessTimeIcon />}
            color="#0288d1"
          />
        </Grid2>
      </Grid2>
    </FeatureSection>
  );
}; 