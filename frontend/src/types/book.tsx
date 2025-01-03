export interface Book {
  ID: number;
  title: string;
  author: string;
  genre?: string;
  coverImage?: string;
  rating?: number;
  page_count?: number;
  deleted_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
}