import { z } from "zod"

export const chatbotSchema = z.object({
  name: z.string().min(2, "Chatbot name must be at least 2 characters"),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Please enter a valid hex color"),
  welcomeMessage: z.string().min(10, "Welcome message must be at least 10 characters"),
})

export type ChatbotData = z.infer<typeof chatbotSchema>
