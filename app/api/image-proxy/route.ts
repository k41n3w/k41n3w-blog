import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    // Get the image URL from the query parameter
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return new NextResponse("Missing image URL", { status: 400 })
    }

    // Decode the URL if it's encoded
    const decodedUrl = decodeURIComponent(imageUrl)

    // Fetch the image
    const imageResponse = await fetch(decodedUrl, {
      headers: {
        // Forward user agent to avoid being blocked by some services
        "User-Agent": request.headers.get("user-agent") || "Mozilla/5.0",
      },
    })

    if (!imageResponse.ok) {
      return new NextResponse(`Failed to fetch image: ${imageResponse.statusText}`, {
        status: imageResponse.status,
      })
    }

    // Get the image data
    const imageData = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg"

    // Return the image with caching headers
    return new NextResponse(imageData, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
        "Content-Length": imageData.byteLength.toString(),
      },
    })
  } catch (error: any) {
    console.error("Image proxy error:", error)
    return new NextResponse(`Error processing image: ${error.message}`, { status: 500 })
  }
}
