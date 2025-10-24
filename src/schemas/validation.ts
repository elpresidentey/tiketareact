import { z } from 'zod'

// Authentication validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long')
})

export const signupSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password must be less than 100 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

// Ticket validation schemas
export const createTicketSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  status: z.enum(['open', 'in_progress', 'closed'], {
    message: 'Please select a valid status'
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    message: 'Please select a valid priority'
  }),
  tags: z
    .array(z.string().min(1).max(20))
    .max(10, 'Maximum 10 tags allowed')
    .default([])
})

export const updateTicketSchema = createTicketSchema.partial().extend({
  id: z.string().min(1, 'Ticket ID is required')
})

// Type inference from schemas
export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type CreateTicketFormData = z.infer<typeof createTicketSchema>
export type UpdateTicketFormData = z.infer<typeof updateTicketSchema>