export const ROLES = ["STUDENT", "TEACHER", "ADMIN"] as const;
export const LANGUAGES = ["ru", "kz"] as const;
export const COURSE_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED", "DELETED"] as const;
export const MATERIAL_TYPES = ["TEXT", "PDF", "VIDEO_URL", "FILE"] as const;
export const QUESTION_TYPES = ["SINGLE", "MULTIPLE", "TEXT"] as const;
export const ENROLLMENT_STATUSES = ["ACTIVE", "COMPLETED", "CANCELLED"] as const;

export type Role = (typeof ROLES)[number];
export type Language = (typeof LANGUAGES)[number];
export type CourseStatus = (typeof COURSE_STATUSES)[number];
export type MaterialType = (typeof MATERIAL_TYPES)[number];
export type QuestionType = (typeof QUESTION_TYPES)[number];
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string | null;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    messageRu: string;
    messageKz: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}
