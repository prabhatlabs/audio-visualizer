declare module "yt-search" {
  interface Video {
    videoId: string;
    url: string;
    title: string;
    description: string;
    image: string;
    thumbnail: string;
    timestamp: string;
    duration: { seconds: number; timestamp: string };
    ago: string;
    views: number;
    author: { name: string; url: string };
  }

  interface SearchResult {
    videos: Video[];
    playlists: any[];
    channels: any[];
    live: any[];
  }

  export default function ytSearch(query: string): Promise<SearchResult>;
}
