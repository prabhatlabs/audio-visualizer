import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  let imageUrl = request.nextUrl.searchParams.get("url");
  if (!imageUrl) {
    return Response.json({ error: "Missing image URL" }, { status: 400 });
  }

  imageUrl = imageUrl.replace(/\/[^/]+$/, "/sddefault.jpg");

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Failed to fetch image");

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch (error) {
    console.error("Thumbnail proxy error:", error);
    return Response.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
