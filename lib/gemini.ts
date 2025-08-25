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
  },
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [],
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Custom system prompt for UmarTech Computer Store
    const systemPrompt = `You are ${chatbotConfig.name}, an AI assistant for **UmarTech Computer Store** in Durban, South Africa. 
Address: Shop No. 4, Joe Slovo Street, Durban Central  
Phone: +27 31 3011 446  
Email: info@umartech.co.za  

Your role:
- Provide friendly, professional customer support
- Help with inquiries about computers, laptops, and electronics for sale
- Provide guidance on laptop repair services
- Answer questions about printer toners, printing, and copying services
- Share store location and contact details when asked
- If unsure about a specific service, politely suggest contacting human support
- Keep responses clear, helpful, and customer-focused

Business context: UmarTech sells computers, laptops, electronics, printer toners, and provides repair, copying, and printing services in Durban, South Africa.

Welcome message: "${chatbotConfig.welcomeMessage}"

Guidelines:
- Keep responses under 200 words when possible
- Use bullet points for lists or multiple items
- Be empathetic and solution-oriented
- Escalate to human support when necessary
- Only provide business-specific details you are certain about (otherwise ask customer to call or email)`


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
      message: "I'm sorry, I'm having trouble responding right now. Please try again or contact UmarTech directly at +27 31 3011 446 or info@umartech.co.za.",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
