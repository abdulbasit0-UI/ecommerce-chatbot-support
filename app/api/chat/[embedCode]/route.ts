import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateChatResponse } from "@/lib/gemini"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function POST(request: NextRequest, { params }: { params: { embedCode: string } }) {
  const { embedCode } = await params // Add this line - you forgot to await params

  try {
    const { message, sessionId } = await request.json()

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "Message and sessionId are required" }, 
        { status: 400, headers: corsHeaders }
      )
    }

    // Find chatbot by embed code
    const chatbot = await prisma.chatbot.findUnique({
      where: { embedCode },
      include: { user: true },
    })

    if (!chatbot || !chatbot.isActive) {
      return NextResponse.json(
        { error: "Chatbot not found or inactive" }, 
        { status: 404, headers: corsHeaders }
      )
    }

    // Find or create conversation
    let conversation = await prisma.chatConversation.findFirst({
      where: {
        chatbotId: chatbot.id,
        sessionId,
      },
      include: {
        messages: {
          orderBy: { timestamp: "asc" },
          take: 20, // Limit conversation history
        },
      },
    })

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          chatbotId: chatbot.id,
          sessionId,
        },
        include: {
          messages: true,
        },
      })
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        content: message,
        isFromUser: true,
      },
    })

    // Prepare conversation history for Gemini
    const conversationHistory = conversation.messages.map((msg) => ({
      role: msg.isFromUser ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    }))

    // Generate AI response
    const aiResponse = await generateChatResponse(
      message,
      {
        name: chatbot.name,
        welcomeMessage: chatbot.welcomeMessage,
        businessContext: chatbot.user.businessName || undefined,
      },
      conversationHistory,
    )

    // Save AI response
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        content: aiResponse.message,
        isFromUser: false,
      },
    })

    return NextResponse.json(
      {
        message: aiResponse.message,
        success: aiResponse.success,
      },
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500, headers: corsHeaders }
    )
  }
}

// Handle CORS for embed script
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}