import ControlBar from "./components/ControlBar";
import DynamicIsland from './components/DynamicIsland';
import LyricsDisplay from "./components/LyricsDisplay";
import VisualizerPage from "./pages/VisualizerPage";
import { AudioAnalysisProvider } from "./providers/AudioAnalysisProvider";

const App = () => {
  return (
    <div className="w-dvw h-dvh flex items-center justify-center">
      <DynamicIsland />
      <AudioAnalysisProvider noOfBands={40} children={<VisualizerPage />} />
      <LyricsDisplay />
      <ControlBar />
    </div>
  );
};

export default App;
