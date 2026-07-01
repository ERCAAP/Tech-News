import { z } from 'zod';

const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export function validateRegistration(data: unknown) {
  return registrationSchema.parse(data);
}

export function validateLogin(data: unknown) {
  return loginSchema.parse(data);
} 