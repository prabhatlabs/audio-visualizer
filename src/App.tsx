import ControlBar from "./components/ControlBar";
import YouTubePlayer from "./components/YouTubePlayer";
import LyricsDisplay from "./components/LyricsDisplay";
import VisualizerPage from "./pages/VisualizerPage";
import { AudioAnalysisProvider } from "./providers/AudioAnalysisProvider";

const App = () => {
  return (
    <div className="w-dvw h-dvh flex items-center justify-center">
      <AudioAnalysisProvider noOfBands={40} children={<VisualizerPage />} />
      <LyricsDisplay />
      <ControlBar />
      <YouTubePlayer />
    </div>
  );
};

export default App;
