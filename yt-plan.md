# Project Plan: Zero-Cost YouTube Music Player

This plan outlines the architecture for a React + TypeScript music player that utilizes a "keyless" search strategy and `react-player` for audio-only playback.

---

## 1. Core Architecture
The project follows a **Hybrid Client-Server** model to handle YouTube searching without exposing API keys or hitting strict quotas.

*   **Frontend:** React (Vite) + TypeScript + Tailwind CSS.
*   **Backend:** Next.js API Routes (or a small Express server).
*   **Audio Engine:** `react-player` (YouTube IFrame API).
*   **Search Engine:** `yt-search` (Scraper-based, keyless).

---

## 2. Implementation Roadmap

### Phase 1: Keyless Search Backend
Create an API endpoint that handles search queries to avoid CORS issues and keep search logic off the client.

*   **Action:** Install `yt-search` on the server.
*   **Task:** Create a GET endpoint `/api/search?q=...` that returns the top 5 video results (ID, Title, Thumbnail, Duration).

### Phase 2: Audio Engine Component
Build the playback logic using `react-player`.

*   **Configuration:** 
    *   Set `width` and `height` to `0` or `1px`.
    *   Enable `playing` state based on global UI controls.
    *   Listen to `onProgress` for future lyrics synchronization.

### Phase 3: Global State & UI
Manage the "Currently Playing" track using a state management tool (Zustand or React Context).

*   **Components:**
    *   `<SearchBar/>`: Triggers the backend fetch.
    *   `<ResultList/>`: Displays search results and updates the "Active Track."
    *   `<PlayerControls/>`: Custom UI for Play/Pause, Seek, and Volume.

---

## 3. Technical Specifications

### Data Structures (TypeScript)
```typescript
interface Track {
  videoId: string;
  title: string;
  thumbnail: string;
  timestamp: string; // Duration (e.g., "3:45")
  author: string;
}
```

### Dependencies
*   `yt-search`: For keyless metadata retrieval.
*   `react-player`: For handling the YouTube stream.
*   `lucide-react`: For clean, developer-first UI icons.

---

## 4. Zero-Cost Optimizations
*   **Caching:** Store search results in `localStorage` or a Turso DB to prevent redundant scraping.
*   **Lazy Loading:** Only load the `react-player` component when a song is actually selected to keep the initial bundle small.
*   **Privacy-First:** Use `youtube-nocookie.com` configuration within `react-player` to minimize user tracking.

---

## 5. Next Steps
1. Initialize the React + TS repository.
2. Set up the `/api/search` route.
3. Integrate the `react-player` and test audio-only playback on mobile/desktop.
