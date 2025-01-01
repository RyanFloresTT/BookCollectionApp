import React from 'react';
import Grid2 from '@mui/material/Grid2';
import { Book } from '../../../../types/Book';
import { StatCard } from '../../../../components/Stats/StatCard';
import { FeatureSection } from '../../../../components/Stats/FeatureSection';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import StarIcon from '@mui/icons-material/Star';

interface BasicStatsProps {
  books: Book[];
}

export const BasicStats: React.FC<BasicStatsProps> = ({ books }) => {
  const totalBooks = books.length;
  const completedBooks = books.filter(book => book.finished_at).length;
  const inProgressBooks = books.filter(book => book.started_at && !book.finished_at).length;
  const averageRating = React.useMemo(() => {
    const ratedBooks = books.filter(book => typeof book.rating === 'number');
    if (ratedBooks.length === 0) return 0;
    const totalRating = ratedBooks.reduce((sum, book) => sum + (book.rating || 0), 0);
    return Math.round((totalRating / ratedBooks.length) * 10) / 10;
  }, [books]);

  return (
    <FeatureSection title="Basic Stats" icon="📊">
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Books"
            value={totalBooks.toString()}
            subtitle="in collection"
            icon={<MenuBookIcon />}
            color="#1565c0"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Completed"
            value={completedBooks.toString()}
            subtitle="books finished"
            icon={<CheckCircleIcon />}
            color="#2e7d32"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="In Progress"
            value={inProgressBooks.toString()}
            subtitle="currently reading"
            icon={<AutoStoriesIcon />}
            color="#ed6c02"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Average Rating"
            value={averageRating > 0 ? averageRating.toString() : 'No ratings'}
            subtitle="out of 5 stars"
            icon={<StarIcon />}
            color="#7b1fa2"
          />
        </Grid2>
      </Grid2>
    </FeatureSection>
  );
}; 