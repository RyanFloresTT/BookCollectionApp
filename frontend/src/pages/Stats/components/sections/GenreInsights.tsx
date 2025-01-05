import React from 'react';
import { Box, Typography } from '@mui/material';
import { FeatureSection } from '../../../../components/Stats/FeatureSection';
import { Book } from '../../../../types/book';
import { Pie } from 'react-chartjs-2';
import { useSubscriptionStatus } from '../../../../hooks/useSubscriptionStatus';
import '../../../../config/chartjs';

interface GenreInsightsProps {
  books: Book[];
}

export const GenreInsights: React.FC<GenreInsightsProps> = ({ books }) => {
  const { isPremium } = useSubscriptionStatus();

  // Calculate genre distribution data
  const genreData = React.useMemo(() => {
    const genreCounts: Record<string, number> = {};
    books.forEach(book => {
      if (book.genre) {
        genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
      }
    });

    const sortedGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8); // Show top 8 genres

    return {
      labels: sortedGenres.map(([genre]) => genre),
      datasets: [{
        data: sortedGenres.map(([, count]) => count),
        backgroundColor: [
          '#1565c0', '#2e7d32', '#ed6c02', '#7b1fa2',
          '#0288d1', '#2e7d32', '#f44336', '#9c27b0'
        ],
        borderWidth: 1
      }]
    };
  }, [books]);

  // Calculate page distribution by genre (premium feature)
  const pageDistributionData = React.useMemo(() => {
    const genrePages: Record<string, number> = {};
    books.forEach(book => {
      if (book.genre && book.page_count) {
        genrePages[book.genre] = (genrePages[book.genre] || 0) + book.page_count;
      }
    });

    const sortedGenres = Object.entries(genrePages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8); // Show top 8 genres

    return {
      labels: sortedGenres.map(([genre]) => genre),
      datasets: [{
        label: 'Pages Read',
        data: sortedGenres.map(([, pages]) => pages),
        backgroundColor: [
          '#1565c0', '#2e7d32', '#ed6c02', '#7b1fa2',
          '#0288d1', '#2e7d32', '#f44336', '#9c27b0'
        ],
        borderWidth: 1
      }]
    };
  }, [books]);

  return (
    <FeatureSection title="Genre Insights" icon="📚">
      {/* Genre Distribution Chart */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Genre Distribution
        </Typography>
        <Box sx={{ 
          height: 300,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Box sx={{ width: '100%', maxWidth: 600 }}>
            <Pie
              data={genreData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      boxWidth: 12,
                      font: { size: 11 }
                    }
                  }
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Pages per Genre Chart (Premium Only) */}
      {isPremium && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Pages Read by Genre
          </Typography>
          <Box sx={{ 
            height: 300,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Box sx={{ width: '100%', maxWidth: 600 }}>
              <Pie
                data={pageDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 12,
                        font: { size: 11 }
                      }
                    }
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      )}
    </FeatureSection>
  );
}; 