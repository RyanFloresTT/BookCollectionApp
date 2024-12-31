export interface Book {
  id: string;
  title: string;
  author: string;
  genre?: string;
  page_count?: number;
  rating?: number;
  started_at?: string;
  finished_at?: string;
  created_at: string;
  updated_at: string;
} 