import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ embedCode: string }> }) {
  const { embedCode } = await params
  
  try {
    const chatbot = await prisma.chatbot.findUnique({
      where: { embedCode: embedCode },
      select: {
        id: true,
        name: true,
        primaryColor: true,
        welcomeMessage: true,
        isActive: true,
      },
    })

    if (!chatbot || !chatbot.isActive) {
      return NextResponse.json(
        { error: "Chatbot not found or inactive" }, 
        { 
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          }
        }
      )
    }

    return NextResponse.json(chatbot, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS", 
        "Access-Control-Allow-Headers": "Content-Type",
      }
    })
    
  } catch (error) {
    console.error("Config API error:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      }
    )
  }
}

// Handle CORS for embed script
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}