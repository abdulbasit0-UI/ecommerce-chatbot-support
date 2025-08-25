import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function generateChatResponse(
  message: string,
  chatbotConfig: {
    name: string
    welcomeMessage: string
    businessContext?: string
  },
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [],
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Create system prompt for ecommerce context
    const systemPrompt = `You are ${chatbotConfig.name}, an AI customer support assistant for an ecommerce business. 

Your role:
- Provide helpful, friendly, and professional customer support
- Answer questions about products, orders, shipping, returns, and general inquiries
- Be concise but thorough in your responses
- If you don't know something specific about the business, politely ask for clarification or suggest contacting human support
- Always maintain a helpful and positive tone
- Focus on solving customer problems and providing excellent service

Business context: ${chatbotConfig.businessContext || "General ecommerce business"}

Welcome message: "${chatbotConfig.welcomeMessage}"

Guidelines:
- Keep responses under 200 words when possible
- Use bullet points for lists or multiple items
- Be empathetic to customer concerns
- Offer to escalate to human support when needed
- Don't make promises about specific policies unless you're certain`

    // Build conversation history
    let conversationText = systemPrompt + "\n\nConversation:\n"

    conversationHistory.forEach((msg) => {
      conversationText += `${msg.role === "user" ? "Customer" : "Assistant"}: ${msg.content}\n`
    })

    conversationText += `Customer: ${message}\nAssistant:`

    const result = await model.generateContent(conversationText)
    const response = await result.response
    const text = response.text()

    return {
      success: true,
      message: text.trim(),
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    return {
      success: false,
      message: "I'm sorry, I'm having trouble responding right now. Please try again or contact our support team.",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
