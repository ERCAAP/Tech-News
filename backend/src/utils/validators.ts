import { z } from 'zod';

export const registrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().optional(),
  birthdate: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  locale: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phoneNumber: z.string().optional(),
  birthdate: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  locale: z.string().optional(),
  picture: z.string().url().optional()
});

export function validateRegistration(data: unknown) {
  return registrationSchema.parse(data);
}

export function validateLogin(data: unknown) {
  return loginSchema.parse(data);
}

export function validateProfileUpdate(data: unknown) {
  return profileUpdateSchema.parse(data);
} 