import cors from "cors";
import express from "express";
import yts from "yt-search";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/search", async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: "Missing search query" });
    }

    try {
        const results = await yts(query);
        const videos = results.videos.slice(0, 10).map((video) => ({
            videoId: video.videoId,
            url: video.url,
            title: video.title,
            thumbnail: video.thumbnail,
            timestamp: video.timestamp,
            author: video.author.name,
        }));
        res.json({ items: videos });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Failed to search YouTube" });
    }
});

app.get("/api/proxy/thumbnail", async (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) {
        return res.status(400).json({ error: "Missing image URL" });
    }

    try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error("Failed to fetch image");

        const contentType = response.headers.get("content-type");
        res.setHeader("Content-Type", contentType || "image/jpeg");
        
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
    } catch (error) {
        console.error("Proxy error:", error);
        res.status(500).json({ error: "Failed to proxy image" });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
