export interface Book {
  ID: number;
  title: string;
  author: string;
  genre?: string;
  coverImage?: string;
  rating?: number;
  pageCount?: number;
  deleted_at?: string | null;
}