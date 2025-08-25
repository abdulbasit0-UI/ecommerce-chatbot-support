import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email },
    })

    return NextResponse.json({ exists: !!user })
  } catch (error) {
    console.error("Check user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
