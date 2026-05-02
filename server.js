import express from 'express';
import cors from 'cors';
import yts from 'yt-search';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Missing search query' });
  }

  try {
    const results = await yts(query);
    const videos = results.videos.slice(0, 10).map(video => ({
      videoId: video.videoId,
      title: video.title,
      thumbnail: video.thumbnail,
      timestamp: video.timestamp,
      author: video.author.name,
    }));
    res.json({ items: videos });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search YouTube' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
