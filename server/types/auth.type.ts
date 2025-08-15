import { z } from "zod";

export const ZPasswordSchema = z
  .string()
  .min(8, { message: "Must be at least 8 characters in length" })
  .max(72, { message: "Cannot be more than 72 characters in length" })
  .refine((value) => value.length > 25 || /[A-Z]/.test(value), {
    message: "One uppercase character",
  })
  .refine((value) => value.length > 25 || /[a-z]/.test(value), {
    message: "One lowercase character",
  })
  .refine((value) => value.length > 25 || /\d/.test(value), {
    message: "One number",
  })
  .refine(
    (value) =>
      value.length > 25 || /[`~<>?,./!@#$%^&*()\-_"'+=|{}[\];:\\]/.test(value),
    {
      message: "One special character is required",
    }
  );

export const ZUsernameSchema = z
  .string()
  .min(3, { message: "Username must be at least 3 characters" })
  .max(50, { message: "Username cannot exceed 50 characters" })
  .regex(/^[a-zA-Z0-9_-]+$/, { message: "Username can only contain letters, numbers, underscores, and hyphens" })
  .transform((val) => val.toLowerCase());

export const ZSignUpSchema = z.object({
  username: ZUsernameSchema,
  password: ZPasswordSchema,
});

export type SignUpSchema = z.infer<typeof ZSignUpSchema>;

export const ZLoginSchema = z.object({
  username: ZUsernameSchema,
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .max(255, { message: "Password is too long" }),
});

export const ZLoginResponseSchema = z.object({
    token: z.string().min(1)
})

export type LoginSchema = z.infer<typeof ZLoginSchema>

export const ZUserSchema = z.object({
    id: z.uuidv4({ message: "Invalid user ID format" }),
    username: z.string().min(1),
    success: z.boolean().optional()
});

// Folder validation schemas
export const ZFolderIdSchema = z
  .string()
  .min(5, { message: "Folder ID must be at least 5 characters" })
  .max(100, { message: "Folder ID cannot exceed 100 characters" })
  .regex(/^[a-zA-Z0-9_-]+$/, { message: "Folder ID can only contain letters, numbers, underscores, and hyphens" });

export const ZCreateFolderSchema = z.object({
  folderId: ZFolderIdSchema,
});

export const ZDeleteFolderSchema = z.object({
  folderId: ZFolderIdSchema,
});

export const ZGetFolderSchema = z.object({
  folderId: z.string().uuid({ message: "Invalid folder UUID" }),
});

// File validation schemas
export const ZFileIdSchema = z
  .string()
  .min(1, { message: "File ID is required" })
  .max(255, { message: "File ID is too long" });

export const ZDeleteFilesSchema = z.object({
  fileIds: z.array(ZFileIdSchema).min(1, { message: "At least one file ID is required" }).max(100, { message: "Cannot delete more than 100 files at once" }),
});

export const ZGetFilesFromFolderSchema = z.object({
  folderId: z.string().uuid({ message: "Invalid folder UUID" }),
});

// Sharing validation schemas
export const ZAccessSchema = z.enum(["read", "write"], { message: "Access must be 'read' or 'write'" });

export const ZShareFolderSchema = z.object({
  folderId: z.string().uuid({ message: "Invalid folder UUID" }),
  targetUserIds: z.array(z.string().uuid({ message: "Invalid user UUID" })).min(1, { message: "At least one user ID is required" }).max(50, { message: "Cannot share with more than 50 users at once" }),
  access: ZAccessSchema,
});

export const ZShareFileSchema = z.object({
  fileId: ZFileIdSchema,
  targetUserIds: z.array(z.string().uuid({ message: "Invalid user UUID" })).min(1, { message: "At least one user ID is required" }).max(50, { message: "Cannot share with more than 50 users at once" }),
  access: ZAccessSchema,
});

// Search validation schema
export const ZSearchUsersSchema = z.object({
  query: z.string().min(2, { message: "Search query must be at least 2 characters" }).max(50, { message: "Search query cannot exceed 50 characters" }),
});

export const ZGetUserByIdSchema = z.object({
  id: z.string().uuid({ message: "Invalid user UUID" }),
});


export type UserSchema = z.infer<typeof ZUserSchema>
