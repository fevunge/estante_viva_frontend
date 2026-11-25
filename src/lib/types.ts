// Hand-written mirrors of backend/models/*.py — keep in sync.

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  color: string;
  has_cover: boolean;
  page_count: number;
  size_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  total_books: number;
  total_categories: number;
  total_pages: number;
}

export interface Me {
  user_id: string;
  email: string | null;
  is_admin: boolean;
}

export interface Note {
  id: string;
  book_id: string;
  page: number;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  book_id: string;
  page: number;
  label: string;
  created_at: string;
}

export interface Progress {
  book_id: string;
  page: number;
  total_pages: number;
  updated_at: string;
}

export interface RecentBook {
  book: Book;
  page: number;
  total_pages: number;
  updated_at: string;
}

export const PALETTE = [
  "#585b70",
  "#f38ba8",
  "#a6e3a1",
  "#f9e2af",
  "#89b4fa",
  "#f5c2e7",
  "#94e2d5",
];

export const coverUrl = (b: Book) =>
  `/api/books/${b.id}/cover?v=${encodeURIComponent(b.updated_at)}`;
export const pdfUrl = (b: Book) => `/api/books/${b.id}/pdf?v=${encodeURIComponent(b.updated_at)}`;
