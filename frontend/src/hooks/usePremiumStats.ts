import { useMemo } from 'react';
import { Book } from '../types/book';

interface PremiumStats {
  currentStreak: number;
  readingVelocity: number;
  peakSeason: {
    season: string;
    count: number;
  };
  bestSprint: {
    count: number;
    start: Date | null;
    end: Date | null;
  };
}

export const usePremiumStats = (books: Book[]): PremiumStats => {
  return useMemo(() => {
    // Calculate current streak
    const calculateStreak = () => {
      if (books.length === 0) return 0;

      // Sort books by completion date
      const sortedBooks = [...books].sort((a, b) => 
        new Date(b.finished_at || '').getTime() - new Date(a.finished_at || '').getTime()
      );

      let currentStreak = 0;
      const today = new Date();
      let lastDate = today;

      for (const book of sortedBooks) {
        if (!book.finished_at) continue;

        const completedDate = new Date(book.finished_at);
        const dayDiff = Math.floor((lastDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));

        if (dayDiff <= 1) {
          currentStreak++;
          lastDate = completedDate;
        } else {
          break;
        }
      }

      return currentStreak;
    };

    // Calculate reading velocity (books per month)
    const calculateVelocity = () => {
      const completedBooks = books.filter(book => book.finished_at);
      const monthsActive = completedBooks.length > 0 ?
        Math.max(1, (new Date().getTime() - new Date(completedBooks[completedBooks.length - 1].finished_at || '').getTime()) / (1000 * 60 * 60 * 24 * 30)) : 1;
      return completedBooks.length / monthsActive;
    };

    // Calculate peak reading season
    const calculatePeakSeason = () => {
      const seasonCounts = { Spring: 0, Summer: 0, Fall: 0, Winter: 0 };

      books.forEach(book => {
        if (!book.finished_at) return;
        const month = new Date(book.finished_at).getMonth();

        if (month >= 2 && month <= 4) seasonCounts.Spring++;
        else if (month >= 5 && month <= 7) seasonCounts.Summer++;
        else if (month >= 8 && month <= 10) seasonCounts.Fall++;
        else seasonCounts.Winter++;
      });

      return Object.entries(seasonCounts)
        .reduce((max, [season, count]) => count > max.count ? { season, count } : max, { season: '', count: -1 });
    };

    // Calculate best reading sprint (most books in a 14-day period)
    const calculateBestSprint = () => {
      const completedBooks = books
        .filter(book => book.started_at && book.finished_at)
        .sort((a, b) => new Date(a.finished_at!).getTime() - new Date(b.finished_at!).getTime());

      if (completedBooks.length < 2) return { count: 0, start: null, end: null };

      let maxCount = 0;
      let maxStart = null;
      let maxEnd = null;

      for (let i = 0; i < completedBooks.length; i++) {
        const start = new Date(completedBooks[i].finished_at!);
        const end = new Date(completedBooks[i].finished_at!);
        end.setDate(end.getDate() + 14);

        let count = 1;
        for (let j = i + 1; j < completedBooks.length; j++) {
          const date = new Date(completedBooks[j].finished_at!);
          if (date <= end) count++;
        }

        if (count > maxCount) {
          maxCount = count;
          maxStart = start;
          maxEnd = end;
        }
      }

      return { count: maxCount, start: maxStart, end: maxEnd };
    };

    return {
      currentStreak: calculateStreak(),
      readingVelocity: calculateVelocity(),
      peakSeason: calculatePeakSeason(),
      bestSprint: calculateBestSprint(),
    };
  }, [books]);
}; 