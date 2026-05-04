import yts from "yt-search";

const port = 3001;

console.log(`Backend server starting on port ${port}...`);

Bun.serve({
    port,
    async fetch(req) {
        const url = new URL(req.url);
        const path = url.pathname;

        // CORS headers
        const headers = new Headers({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        });

        // Handle preflight
        if (req.method === "OPTIONS") {
            return new Response(null, { headers });
        }

        try {
            if (path === "/api/search") {
                const query = url.searchParams.get("q");
                if (!query) {
                    return new Response(
                        JSON.stringify({ error: "Missing search query" }),
                        {
                            status: 400,
                            headers: {
                                ...Object.fromEntries(headers),
                                "Content-Type": "application/json",
                            },
                        },
                    );
                }

                const results = await yts(query);
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

                return new Response(JSON.stringify({ items: videos }), {
                    headers: {
                        ...Object.fromEntries(headers),
                        "Content-Type": "application/json",
                    },
                });
            }

            if (path === "/api/proxy/thumbnail") {
                let imageUrl = url.searchParams.get("url");
                if (!imageUrl) {
                    return new Response(
                        JSON.stringify({ error: "Missing image URL" }),
                        {
                            status: 400,
                            headers: {
                                ...Object.fromEntries(headers),
                                "Content-Type": "application/json",
                            },
                        },
                    );
                }

                // Replace the last part of the URL (e.g., hq720.jpg) with sddefault.jpg
                imageUrl = imageUrl.replace(/\/[^/]+$/, "/sddefault.jpg");

                const response = await fetch(imageUrl);
                if (!response.ok) throw new Error("Failed to fetch image");

                const contentType =
                    response.headers.get("content-type") || "image/jpeg";
                const arrayBuffer = await response.arrayBuffer();

                return new Response(arrayBuffer, {
                    headers: {
                        ...Object.fromEntries(headers),
                        "Content-Type": contentType,
                        "Cache-Control": "public, max-age=604800, immutable",
                    },
                });
            }

            return new Response("Not Found", { status: 404, headers });
        } catch (error) {
            console.error("Server error:", error);
            return new Response(
                JSON.stringify({ error: "Internal Server Error" }),
                {
                    status: 500,
                    headers: {
                        ...Object.fromEntries(headers),
                        "Content-Type": "application/json",
                    },
                },
            );
        }
    },
});
