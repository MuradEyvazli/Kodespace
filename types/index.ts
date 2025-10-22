// Core Types
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: ProgrammingLanguage;
  tags: string[];
  author: User;
  authorId: string;
  likes: number;
  likedBy: string[];
  bookmarks: number;
  bookmarkedBy: string[];
  views: number;
  isVerified: boolean;
  isPublic: boolean;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  authorId: string;
  snippetId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum UserRole {
  JUNIOR_DEVELOPER = 'junior-developer',
  MID_LEVEL_DEVELOPER = 'mid-level-developer',
  SENIOR_DEVELOPER = 'senior-developer',
  LEAD_DEVELOPER = 'lead-developer',
  PRINCIPAL_ENGINEER = 'principal-engineer',
  MODERATOR = 'moderator'
}

export enum ProgrammingLanguage {
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  PYTHON = 'python',
  JAVA = 'java',
  CSHARP = 'csharp',
  CPP = 'cpp',
  C = 'c',
  GO = 'go',
  RUST = 'rust',
  PHP = 'php',
  RUBY = 'ruby',
  SWIFT = 'swift',
  KOTLIN = 'kotlin',
  HTML = 'html',
  CSS = 'css',
  SQL = 'sql',
  BASH = 'bash',
  JSON = 'json',
  YAML = 'yaml',
  MARKDOWN = 'markdown'
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileFormData {
  name: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  skills: string[];
}

export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SnippetFormData {
  title: string;
  description: string;
  code: string;
  language: ProgrammingLanguage;
  tags: string[];
  isPublic: boolean;
}

// Session Types
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
}

// Database Model Types
export interface UserDocument extends Omit<User, 'id'> {
  _id: string;
  hashedPassword: string;
}

export interface SnippetDocument extends Omit<CodeSnippet, 'id' | 'author'> {
  _id: string;
}

export interface CommentDocument extends Omit<Comment, 'id' | 'author'> {
  _id: string;
}

// Utility Types
export type WithoutId<T> = Omit<T, 'id'>;
export type CreateUserInput = WithoutId<User> & { password: string };
export type UpdateUserInput = Partial<WithoutId<User>>;
export type CreateSnippetInput = WithoutId<CodeSnippet>;
export type UpdateSnippetInput = Partial<WithoutId<CodeSnippet>>;

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  success?: string;
}

// Filter and Search Types
export interface SnippetFilters {
  language?: ProgrammingLanguage;
  tags?: string[];
  author?: string;
  verified?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'likes' | 'views' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserStats {
  totalSnippets: number;
  totalLikes: number;
  totalBookmarks: number;
  totalViews: number;
  verifiedSnippets: number;
  weeklyActivity: number[];
}