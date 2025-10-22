import { ProgrammingLanguage, UserRole } from '@/types';

// Application Constants
export const APP_CONFIG = {
  name: 'KODESPACE',
  description: 'Professional Developer Code Sharing Platform',
  version: '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  supportEmail: 'support@kodespace.dev'
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  SNIPPETS_PER_PAGE: 12,
  COMMENTS_PER_PAGE: 20
} as const;

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,
  BIO_MAX_LENGTH: 500,
  SNIPPET_TITLE_MIN_LENGTH: 3,
  SNIPPET_TITLE_MAX_LENGTH: 100,
  SNIPPET_DESCRIPTION_MAX_LENGTH: 500,
  SNIPPET_CODE_MAX_LENGTH: 50000,
  COMMENT_MIN_LENGTH: 1,
  COMMENT_MAX_LENGTH: 1000,
  TAG_MIN_LENGTH: 2,
  TAG_MAX_LENGTH: 30,
  MAX_TAGS_PER_SNIPPET: 10,
  MAX_SKILLS_PER_USER: 20
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  PROFILE_PICTURE_MAX_SIZE: 2 * 1024 * 1024 // 2MB
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  // Development limits (more lenient for testing)
  DEV_AUTH_REQUESTS: 50,
  DEV_API_REQUESTS: 100,

  // Production limits (stricter for security)
  PROD_AUTH_REQUESTS: 30,
  PROD_API_REQUESTS: 60,

  // Common settings
  AUTH_WINDOW: 15 * 60 * 1000, // 15 minutes
  API_WINDOW: 15 * 60 * 1000, // 15 minutes

  // Legacy (kept for backward compatibility)
  AUTH_ATTEMPTS: 5,
  API_REQUESTS: 100,
  SNIPPET_CREATION: 10,
  SNIPPET_CREATION_WINDOW: 60 * 60 * 1000 // 1 hour
} as const;

// User Roles and Permissions
export const USER_ROLE_HIERARCHY = {
  [UserRole.JUNIOR_DEVELOPER]: 1,
  [UserRole.MID_LEVEL_DEVELOPER]: 2,
  [UserRole.SENIOR_DEVELOPER]: 3,
  [UserRole.LEAD_DEVELOPER]: 4,
  [UserRole.PRINCIPAL_ENGINEER]: 5,
  [UserRole.MODERATOR]: 6
} as const;

export const USER_ROLE_DISPLAY = {
  [UserRole.JUNIOR_DEVELOPER]: {
    name: 'Junior Developer',
    color: 'from-green-500 to-emerald-500',
    level: 1,
    nextLevel: 'Mid-Level Developer',
    requirements: ['Complete 10 code snippets', 'Get 50 upvotes', 'Active for 30 days']
  },
  [UserRole.MID_LEVEL_DEVELOPER]: {
    name: 'Mid-Level Developer',
    color: 'from-blue-500 to-cyan-500',
    level: 2,
    nextLevel: 'Senior Developer',
    requirements: ['Complete 50 code snippets', 'Get 200 upvotes', 'Active for 6 months']
  },
  [UserRole.SENIOR_DEVELOPER]: {
    name: 'Senior Developer',
    color: 'from-purple-500 to-pink-500',
    level: 3,
    nextLevel: 'Lead Developer',
    requirements: ['Complete 100 code snippets', 'Get 500 upvotes', 'Mentor 5 junior developers']
  },
  [UserRole.LEAD_DEVELOPER]: {
    name: 'Lead Developer',
    color: 'from-orange-500 to-red-500',
    level: 4,
    nextLevel: 'Principal Engineer',
    requirements: ['Complete 200 code snippets', 'Get 1000 upvotes', 'Lead 3 projects']
  },
  [UserRole.PRINCIPAL_ENGINEER]: {
    name: 'Principal Engineer',
    color: 'from-indigo-500 to-purple-500',
    level: 5,
    nextLevel: 'Master Engineer',
    requirements: ['Complete 500 code snippets', 'Get 2000 upvotes', 'Contribute to platform']
  },
  [UserRole.MODERATOR]: {
    name: 'Moderator',
    color: 'from-slate-500 to-slate-600',
    level: 6,
    nextLevel: null,
    requirements: []
  }
} as const;

// Programming Languages
export const LANGUAGE_DISPLAY = {
  [ProgrammingLanguage.JAVASCRIPT]: { name: 'JavaScript', color: '#F7DF1E', ext: 'js' },
  [ProgrammingLanguage.TYPESCRIPT]: { name: 'TypeScript', color: '#3178C6', ext: 'ts' },
  [ProgrammingLanguage.PYTHON]: { name: 'Python', color: '#3776AB', ext: 'py' },
  [ProgrammingLanguage.JAVA]: { name: 'Java', color: '#ED8B00', ext: 'java' },
  [ProgrammingLanguage.CSHARP]: { name: 'C#', color: '#239120', ext: 'cs' },
  [ProgrammingLanguage.CPP]: { name: 'C++', color: '#00599C', ext: 'cpp' },
  [ProgrammingLanguage.C]: { name: 'C', color: '#A8B9CC', ext: 'c' },
  [ProgrammingLanguage.GO]: { name: 'Go', color: '#00ADD8', ext: 'go' },
  [ProgrammingLanguage.RUST]: { name: 'Rust', color: '#000000', ext: 'rs' },
  [ProgrammingLanguage.PHP]: { name: 'PHP', color: '#777BB4', ext: 'php' },
  [ProgrammingLanguage.RUBY]: { name: 'Ruby', color: '#CC342D', ext: 'rb' },
  [ProgrammingLanguage.SWIFT]: { name: 'Swift', color: '#FA7343', ext: 'swift' },
  [ProgrammingLanguage.KOTLIN]: { name: 'Kotlin', color: '#7F52FF', ext: 'kt' },
  [ProgrammingLanguage.HTML]: { name: 'HTML', color: '#E34F26', ext: 'html' },
  [ProgrammingLanguage.CSS]: { name: 'CSS', color: '#1572B6', ext: 'css' },
  [ProgrammingLanguage.SQL]: { name: 'SQL', color: '#336791', ext: 'sql' },
  [ProgrammingLanguage.BASH]: { name: 'Bash', color: '#4EAA25', ext: 'sh' },
  [ProgrammingLanguage.JSON]: { name: 'JSON', color: '#000000', ext: 'json' },
  [ProgrammingLanguage.YAML]: { name: 'YAML', color: '#CB171E', ext: 'yml' },
  [ProgrammingLanguage.MARKDOWN]: { name: 'Markdown', color: '#000000', ext: 'md' }
} as const;

// Popular Skills for Suggestions
export const POPULAR_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Next.js',
  'Vue.js', 'Angular', 'Express.js', 'MongoDB', 'PostgreSQL', 'MySQL',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git', 'GraphQL', 'REST APIs',
  'CSS', 'HTML', 'Sass', 'Tailwind CSS', 'Bootstrap', 'Material-UI',
  'Java', 'Spring Boot', 'C++', 'C#', '.NET', 'PHP', 'Laravel',
  'Ruby', 'Ruby on Rails', 'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter',
  'React Native', 'Redux', 'Zustand', 'Jest', 'Cypress', 'Testing Library',
  'Webpack', 'Vite', 'Babel', 'ESLint', 'Prettier', 'CI/CD'
] as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You must be logged in to perform this action',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  VALIDATION_ERROR: 'Please check your input and try again',
  INTERNAL_ERROR: 'An internal server error occurred',
  NETWORK_ERROR: 'Network error. Please check your connection',
  RATE_LIMITED: 'Too many requests. Please try again later',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported file format'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  SNIPPET_CREATED: 'Code snippet created successfully',
  SNIPPET_UPDATED: 'Code snippet updated successfully',
  SNIPPET_DELETED: 'Code snippet deleted successfully',
  COMMENT_ADDED: 'Comment added successfully',
  SNIPPET_LIKED: 'Snippet liked',
  SNIPPET_UNLIKED: 'Snippet unliked',
  SNIPPET_BOOKMARKED: 'Snippet bookmarked',
  SNIPPET_UNBOOKMARKED: 'Snippet removed from bookmarks'
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/signin',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/signout'
  },
  PROFILE: {
    UPDATE: '/api/profile/update',
    CHANGE_PASSWORD: '/api/profile/change-password'
  },
  SNIPPETS: {
    LIST: '/api/snippets',
    CREATE: '/api/snippets',
    GET: (id: string) => `/api/snippets/${id}`,
    UPDATE: (id: string) => `/api/snippets/${id}`,
    DELETE: (id: string) => `/api/snippets/${id}`,
    LIKE: (id: string) => `/api/snippets/${id}/like`,
    BOOKMARK: (id: string) => `/api/snippets/${id}/bookmark`,
    COMMENTS: (id: string) => `/api/snippets/${id}/comments`,
    VERIFY: (id: string) => `/api/snippets/${id}/verify`
  }
} as const;