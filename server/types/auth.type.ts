import { userInfo } from "os";
import { success, z } from "zod";

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

export const ZSignUpSchema = z.object({
  username: z.string().min(3),
  password: ZPasswordSchema,
});

export type SignUpSchema = z.infer<typeof ZSignUpSchema>;

export const ZLoginSchema = z.object({
  username: z.string().min(3),
  password: z
    .string()
    .min(6, { message: "Must be at least 6 characters long" })
    .max(36),
});

export const ZLoginResponseSchema = z.object({
    token: z.string().min(1)
})

export type LoginSchema = z.infer<typeof ZLoginSchema>

export const ZUserSchema = z.object({
    id: z.string(),
    username: z.string(),
    success: z.boolean()
})

export type UserSchema = z.infer<typeof ZUserSchema>
