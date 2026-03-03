import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type RegisterFormData = z.infer<typeof registerSchema>;

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  eventDate: z.string().min(1, "Date is required"),
  eventTime: z.string().min(1, "Time is required"),
  minAttendees: z.number().int().min(2, "Minimum 2 attendees"),
  maxAttendees: z.number().int().min(2).optional(),
  category: z.enum(["bar", "food", "outdoor", "other"]).default("other"),
  isAnonymous: z.boolean().default(false),
});
export type CreateEventFormData = z.infer<typeof createEventSchema>;

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
});
export type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

export const joinWorkspaceSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
});
export type JoinWorkspaceFormData = z.infer<typeof joinWorkspaceSchema>;
