import { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Book } from '../types/book';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface GenreChartData {
  genreDistribution: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
}

export const useGenreChartData = (books: Book[]): GenreChartData => {
  return useMemo(() => {
    // Calculate genre distribution
    const genreCounts = books.reduce((acc: { [key: string]: number }, book) => {
      const genre = book.genre || 'Unknown';
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF99CC', '#99CCFF', '#99FF99', '#FFCC99'
    ];

    const labels = Object.keys(genreCounts);
    const data = Object.values(genreCounts);

    return {
      genreDistribution: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(color => color.replace('0.6', '1')),
          borderWidth: 1
        }]
      }
    };
  }, [books]);
}; 