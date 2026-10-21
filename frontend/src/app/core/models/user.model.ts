import { Student } from './student.model';

export type UserRole = 'admin' | 'student';

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  studentProfile?: Student | null;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user: User;
}
