import { z } from "zod";

const passwordSchema = z
	.string("Password is required")
	.min(12, "Password must be at least 12 characters")
	.regex(/[A-Z]/, "Password must include at least one uppercase letter")
	.regex(/[a-z]/, "Password must include at least one lowercase letter")
	.regex(/[0-9]/, "Password must include at least one number")
	.regex(
		/[^A-Za-z0-9]/,
		"Password must include at least one special character",
	);

export const loginSchema = z.object({
	email: z.email("Email is required and must be valid"),
	password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
	name: z.string().min(2, "Name must have at least 2 characters"),
	email: z.email("Email is required and must be valid"),
	password: passwordSchema,
});

export const refreshTokenSchema = z.object({
	refreshToken: z.string().min(1, "Refresh token is required"),
});
