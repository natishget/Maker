import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "password must be atleast 6 characters")
    .regex(/[A-Z]/, "Password must have atleast one Uppercase letter")
    .regex(/[a-z]/, "Password must have atleast one Lowercase letter")
    .regex(/[0-9]/, "Password must atleast have one number")
    .regex(/^[a-zA-Z0-9]/, "Password must have atleast one Special character"),
  companyId: z.string().uuid("Invalid company ID"),
});

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginAdminSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .optional(),
});

export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  username: z.string().min(3, "Username is required"),
  tg_bot_token: z
    .string()
    .min(10, "Telegram bot token must be at least 10 characters long"),
  tg_chat_id: z
    .number()
    .min(12, "Telegram chat ID must be 12 numbers long")
    .max(12, "Telegram chat ID must be 12 numbers long"),
});
