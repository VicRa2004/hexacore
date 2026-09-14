import { z } from "zod";

/** Numeric ID from route params */
export const permissionIdSchema = z.object({
	id: z.string().regex(/^\d+$/, "ID must be a valid number").transform(Number),
});

/** Body to create a permission */
export const createPermissionSchema = z.object({
	resource: z
		.string()
		.min(1, "resource cannot be empty")
		.max(100, "resource cannot exceed 100 characters"),
	action: z
		.string()
		.min(1, "action cannot be empty")
		.max(50, "action cannot exceed 50 characters"),
});

/** Body to update a permission */
export const updatePermissionSchema = z.object({
	resource: z
		.string()
		.min(1, "resource cannot be empty")
		.max(100, "resource cannot exceed 100 characters"),
	action: z
		.string()
		.min(1, "action cannot be empty")
		.max(50, "action cannot exceed 50 characters"),
});

/** User ID from route params */
export const userIdParamSchema = z.object({
	userId: z
		.string()
		.regex(/^\d+$/, "userId must be a valid number")
		.transform(Number),
});
