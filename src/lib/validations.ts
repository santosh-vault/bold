import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

export const wardrobeItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(100, 'Name must be less than 100 characters'),
  category: z.enum(['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'], {
    required_error: 'Category is required',
  }),
  color: z.string().min(1, 'Color is required').max(50, 'Color must be less than 50 characters'),
  brand: z.string().max(50, 'Brand must be less than 50 characters').optional(),
  price: z.number().min(0, 'Price must be positive').max(10000, 'Price must be less than $10,000').optional(),
  image_url: z.string().url('Please enter a valid URL'),
  tags: z.array(z.string().max(30, 'Tag must be less than 30 characters')).max(10, 'Maximum 10 tags allowed'),
});

export const outfitSchema = z.object({
  name: z.string().min(1, 'Outfit name is required').max(100, 'Name must be less than 100 characters'),
  occasion: z.string().min(1, 'Occasion is required'),
  season: z.enum(['All seasons', 'Spring', 'Summer', 'Fall', 'Winter']),
  rating: z.number().min(1).max(5).optional(),
  items: z.array(z.string()).min(1, 'At least one item is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type WardrobeItemFormData = z.infer<typeof wardrobeItemSchema>;
export type OutfitFormData = z.infer<typeof outfitSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;