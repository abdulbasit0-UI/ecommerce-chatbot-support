import { z } from "zod"

export const onboardingSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  productCount: z.enum(["1-10", "11-50", "51-100", "100+"], {
    required_error: "Please select your product count range",
  }),
  referralSource: z.enum(["Google", "Social Media", "Friend", "Other"], {
    required_error: "Please tell us how you heard about us",
  }),
})

export type OnboardingData = z.infer<typeof onboardingSchema>
