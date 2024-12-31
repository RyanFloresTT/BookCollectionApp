import React from 'react';
import Grid2 from '@mui/material/Grid2';
import { StatCard } from '../../../../components/Stats/StatCard';
import { FeatureSection } from '../../../../components/Stats/FeatureSection';
import { Book } from '../../../../types/Book';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SpeedIcon from '@mui/icons-material/Speed';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface ReadingPatternsProps {
  books: Book[];
}

export const ReadingPatterns: React.FC<ReadingPatternsProps> = ({ books }) => {
  // Get completed books sorted by completion date
  const completedBooks = React.useMemo(() => {
    return books
      .filter(book => book.finished_at)
      .sort((a, b) => new Date(b.finished_at!).getTime() - new Date(a.finished_at!).getTime());
  }, [books]);

  // Calculate peak reading season
  const peakSeason = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const seasonCounts = completedBooks
      .filter(book => new Date(book.finished_at!).getFullYear() === currentYear)
      .reduce((counts: Record<string, number>, book) => {
        const completedDate = new Date(book.finished_at!);
        const month = completedDate.getMonth();
        let season = '';

        if (month >= 2 && month <= 4) season = 'Spring';
        else if (month >= 5 && month <= 7) season = 'Summer';
        else if (month >= 8 && month <= 10) season = 'Fall';
        else season = 'Winter';

        counts[season] = (counts[season] || 0) + 1;
        return counts;
      }, {});

    const maxSeason = Object.entries(seasonCounts).reduce((max, [season, count]) => {
      return count > (max.count || 0) ? { season, count } : max;
    }, { season: 'No data', count: 0 });

    return maxSeason;
  }, [completedBooks]);

  // Calculate reading velocity (books per month) - use last 3 months
  const readingVelocity = React.useMemo(() => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentBooks = completedBooks.filter(book => {
      const completedDate = new Date(book.finished_at!);
      return completedDate >= threeMonthsAgo;
    });

    return recentBooks.length > 0 ? Math.round((recentBooks.length / 3) * 10) / 10 : 0;
  }, [completedBooks]);

  // Find best reading sprint (most books in a 14-day period)
  const bestSprint = React.useMemo(() => {
    if (completedBooks.length < 2) return { books: 0, days: 14 };

    let maxBooks = 0;
    const sprintDays = 14;

    // Check each book as a potential end of a sprint
    completedBooks.forEach((endBook, i) => {
      const endDate = new Date(endBook.finished_at!);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - sprintDays);

      // Count books completed within this sprint window
      const booksInSprint = completedBooks.filter(book => {
        const completedDate = new Date(book.finished_at!);
        return completedDate >= startDate && completedDate <= endDate;
      }).length;

      maxBooks = Math.max(maxBooks, booksInSprint);
    });

    return { books: maxBooks, days: sprintDays };
  }, [completedBooks]);

  // Calculate preferred reading days
  const preferredDays = React.useMemo(() => {
    if (completedBooks.length === 0) return 'No data';

    const dayCount = completedBooks.reduce((counts: Record<string, number>, book) => {
      const day = new Date(book.finished_at!).getDay();
      const isWeekend = day === 0 || day === 6;
      const type = isWeekend ? 'weekend' : 'weekday';
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, { weekend: 0, weekday: 0 });

    // Normalize by number of days (5 weekdays vs 2 weekend days)
    const weekendRate = dayCount.weekend / 2; // per weekend day
    const weekdayRate = dayCount.weekday / 5; // per weekday

    return weekendRate > weekdayRate ? 'Weekends' : 'Weekdays';
  }, [completedBooks]);

  return (
    <FeatureSection title="Reading Patterns" icon="📊">
      <Grid2 container spacing={3}>
        {/* Peak Season */}
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Peak Season"
            value={peakSeason.season}
            subtitle={peakSeason.count > 0 ? `${peakSeason.count} books` : 'No data'}
            icon={<WbSunnyIcon />}
            color="#ed6c02"
          />
        </Grid2>

        {/* Reading Velocity */}
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Reading Velocity"
            value={readingVelocity > 0 ? readingVelocity.toString() : 'No data'}
            subtitle="books per month"
            icon={<SpeedIcon />}
            color="#1565c0"
          />
        </Grid2>

        {/* Best Sprint */}
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Best Sprint"
            value={bestSprint.books > 0 ? bestSprint.books.toString() : 'No data'}
            subtitle={bestSprint.books > 0 ? `books in ${bestSprint.days} days` : ''}
            icon={<DirectionsRunIcon />}
            color="#2e7d32"
          />
        </Grid2>

        {/* Preferred Days */}
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Preferred Days"
            value={preferredDays}
            subtitle="most completions"
            icon={<CalendarTodayIcon />}
            color="#7b1fa2"
          />
        </Grid2>
      </Grid2>
    </FeatureSection>
  );
}; 