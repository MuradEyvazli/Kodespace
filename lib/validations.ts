import { z } from 'zod';
import { ProgrammingLanguage, UserRole } from '@/types';
import { VALIDATION, FILE_UPLOAD } from './constants';

// Install zod for runtime validation
// npm install zod

// User Validation Schemas
export const userRegistrationSchema = z.object({
  name: z.string()
    .min(VALIDATION.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`)
    .max(VALIDATION.NAME_MAX_LENGTH, `Name must not exceed ${VALIDATION.NAME_MAX_LENGTH} characters`)
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(VALIDATION.EMAIL_MAX_LENGTH, `Email must not exceed ${VALIDATION.EMAIL_MAX_LENGTH} characters`)
    .toLowerCase(),
  password: z.string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
    .max(VALIDATION.PASSWORD_MAX_LENGTH, `Password must not exceed ${VALIDATION.PASSWORD_MAX_LENGTH} characters`)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const userLoginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required')
});

export const profileUpdateSchema = z.object({
  name: z.string()
    .min(VALIDATION.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`)
    .max(VALIDATION.NAME_MAX_LENGTH, `Name must not exceed ${VALIDATION.NAME_MAX_LENGTH} characters`)
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(VALIDATION.EMAIL_MAX_LENGTH, `Email must not exceed ${VALIDATION.EMAIL_MAX_LENGTH} characters`)
    .toLowerCase(),
  bio: z.string()
    .max(VALIDATION.BIO_MAX_LENGTH, `Bio must not exceed ${VALIDATION.BIO_MAX_LENGTH} characters`)
    .optional(),
  location: z.string()
    .max(100, 'Location must not exceed 100 characters')
    .optional(),
  website: z.string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  github: z.string()
    .regex(/^$|^[\w-]+$/, 'Please enter a valid GitHub username')
    .optional(),
  linkedin: z.string()
    .regex(/^$|^[\w-]+$/, 'Please enter a valid LinkedIn username')
    .optional(),
  twitter: z.string()
    .regex(/^$|^[\w-]+$/, 'Please enter a valid Twitter username')
    .optional(),
  skills: z.array(z.string())
    .max(VALIDATION.MAX_SKILLS_PER_USER, `You can have a maximum of ${VALIDATION.MAX_SKILLS_PER_USER} skills`)
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  newPassword: z.string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
    .max(VALIDATION.PASSWORD_MAX_LENGTH, `Password must not exceed ${VALIDATION.PASSWORD_MAX_LENGTH} characters`)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Code Snippet Validation Schemas
export const snippetCreateSchema = z.object({
  title: z.string()
    .min(VALIDATION.SNIPPET_TITLE_MIN_LENGTH, `Title must be at least ${VALIDATION.SNIPPET_TITLE_MIN_LENGTH} characters`)
    .max(VALIDATION.SNIPPET_TITLE_MAX_LENGTH, `Title must not exceed ${VALIDATION.SNIPPET_TITLE_MAX_LENGTH} characters`)
    .trim(),
  description: z.string()
    .max(VALIDATION.SNIPPET_DESCRIPTION_MAX_LENGTH, `Description must not exceed ${VALIDATION.SNIPPET_DESCRIPTION_MAX_LENGTH} characters`)
    .trim(),
  code: z.string()
    .min(1, 'Code is required')
    .max(VALIDATION.SNIPPET_CODE_MAX_LENGTH, `Code must not exceed ${VALIDATION.SNIPPET_CODE_MAX_LENGTH} characters`),
  language: z.nativeEnum(ProgrammingLanguage),
  tags: z.array(z.string()
    .min(VALIDATION.TAG_MIN_LENGTH, `Tag must be at least ${VALIDATION.TAG_MIN_LENGTH} characters`)
    .max(VALIDATION.TAG_MAX_LENGTH, `Tag must not exceed ${VALIDATION.TAG_MAX_LENGTH} characters`)
    .regex(/^[a-zA-Z0-9-_]+$/, 'Tags can only contain letters, numbers, hyphens, and underscores')
  ).max(VALIDATION.MAX_TAGS_PER_SNIPPET, `You can have a maximum of ${VALIDATION.MAX_TAGS_PER_SNIPPET} tags`),
  isPublic: z.boolean().default(true)
});

export const snippetUpdateSchema = snippetCreateSchema.partial().extend({
  id: z.string().min(1, 'Snippet ID is required')
});

// Comment Validation Schema
export const commentCreateSchema = z.object({
  content: z.string()
    .min(VALIDATION.COMMENT_MIN_LENGTH, `Comment must be at least ${VALIDATION.COMMENT_MIN_LENGTH} character`)
    .max(VALIDATION.COMMENT_MAX_LENGTH, `Comment must not exceed ${VALIDATION.COMMENT_MAX_LENGTH} characters`)
    .trim(),
  snippetId: z.string().min(1, 'Snippet ID is required')
});

// File Upload Validation Schemas
export const profilePictureSchema = z.object({
  file: z.any()
    .refine((file) => file instanceof File, 'Please select a file')
    .refine((file) => file.size <= FILE_UPLOAD.PROFILE_PICTURE_MAX_SIZE,
      `File size must be less than ${FILE_UPLOAD.PROFILE_PICTURE_MAX_SIZE / (1024 * 1024)}MB`)
    .refine((file) => FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.type),
      'Please upload a valid image file (JPEG, PNG, WebP, or GIF)')
});

// Search and Filter Validation
export const snippetFilterSchema = z.object({
  language: z.nativeEnum(ProgrammingLanguage).optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  verified: z.boolean().optional(),
  search: z.string().max(100, 'Search query must not exceed 100 characters').optional(),
  sortBy: z.enum(['createdAt', 'likes', 'views', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10)
});

// API Parameter Validation
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required')
});

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10)
});

// Type helpers for validation results
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type SnippetCreateInput = z.infer<typeof snippetCreateSchema>;
export type SnippetUpdateInput = z.infer<typeof snippetUpdateSchema>;
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type SnippetFilterInput = z.infer<typeof snippetFilterSchema>;

// Validation helper functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return (
    password.length >= VALIDATION.PASSWORD_MIN_LENGTH &&
    password.length <= VALIDATION.PASSWORD_MAX_LENGTH &&
    /(?=.*[a-z])/.test(password) &&
    /(?=.*[A-Z])/.test(password) &&
    /(?=.*\d)/.test(password)
  );
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}