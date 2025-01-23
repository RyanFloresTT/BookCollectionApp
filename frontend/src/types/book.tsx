export interface Book {
  ID: number; // This needs to be capitalized because of the backend. We're using GORM and it's the default name for the primary key.
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