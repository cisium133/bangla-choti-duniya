export interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author?: string;
  publishedDate: string;
  category: string;
  tags: string[];
  imageUrl: string;
  views: number;
  featured?: boolean;
}

export interface StoryCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalStories: number;
  storiesPerPage: number;
}