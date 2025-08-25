import { z } from "zod"

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  businessName: z.string().min(2, "Business name must be at least 2 characters").optional().or(z.literal("")),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
})

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })


  export const deleteAccountSchema = z.object({
    confirmText: z.string(),
    password: z.string().min(1, "Password is required"),
  })
  
export type DeleteAccountData = z.infer<typeof deleteAccountSchema>;
export type ProfileData = z.infer<typeof profileSchema>
export type PasswordData = z.infer<typeof passwordSchema>
