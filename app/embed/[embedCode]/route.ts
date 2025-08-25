import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET(request: NextRequest, { params }: { params: { embedCode: string } }) {
  try {
    // Read the embed template
    const templatePath = join(process.cwd(), "public", "embed-template.js")
    const template = await readFile(templatePath, "utf-8")

    // Return JavaScript with proper headers
    return new NextResponse(template, {
      headers: {
        "Content-Type": "application/javascript",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error("Embed script error:", error)
    return new NextResponse("// Embed script not found", {
      status: 404,
      headers: {
        "Content-Type": "application/javascript",
      },
    })
  }
}
