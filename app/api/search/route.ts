import { NextRequest } from "next/server";
import ytSearch from "yt-search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) {
    return Response.json({ error: "Missing search query" }, { status: 400 });
  }

  try {
    const results = await ytSearch(query);
    const videos = results.videos.slice(0, 10).map((video) => {
      const sddefaultImageUrl = video.thumbnail?.replace(
        /\/[^/]+$/,
        "/sddefault.jpg",
      );
      return {
        videoId: video.videoId,
        url: video.url,
        title: video.title,
        thumbnail: sddefaultImageUrl,
        timestamp: video.timestamp,
        author: video.author.name,
      };
    });

    return Response.json({ items: videos });
  } catch (error) {
    console.error("Search error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
