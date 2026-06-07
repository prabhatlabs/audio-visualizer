import { NextRequest } from "next/server";
import youtubesearchapi from "youtube-search-api";

interface YouTubeSearchItem {
  id: string;
  type: string;
  title: string;
  thumbnail?: {
    thumbnails?: Array<{ url: string; width: number; height: number }>;
  };
  channelTitle?: string;
  length?: { simpleText: string };
}

interface YouTubeSearchResult {
  items: YouTubeSearchItem[];
  nextPage?: unknown;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) {
    return Response.json({ error: "Missing search query" }, { status: 400 });
  }

  try {
    const result = (await youtubesearchapi.GetListByKeyword(
      query,
      false,
      10,
      [{ type: "video" }],
    )) as YouTubeSearchResult;

    const videos = result.items.map((video) => {
      const thumbnails = video.thumbnail?.thumbnails;
      const thumbnailUrl =
        thumbnails?.[thumbnails.length - 1]?.url || "";
      const sddefaultImageUrl = thumbnailUrl.replace(
        /\/[^/]+$/,
        "/sddefault.jpg",
      );
      return {
        videoId: video.id,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        title: video.title,
        thumbnail: sddefaultImageUrl,
        timestamp: video.length?.simpleText || "",
        author: video.channelTitle || "",
      };
    });

    return Response.json({ items: videos });
  } catch (error) {
    console.error("Search error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
