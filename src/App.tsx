import ControlBar from "./components/ControlBar";
import DynamicIsland from "./components/DynamicIsland";
import VisualizerPage from "./pages/VisualizerPage";
import { AudioAnalysisProvider } from "./providers/AudioAnalysisProvider";
import { useAppStore } from "./store/appStore";

const App = () => {
    const ytMode = useAppStore((state) => state.ytMode);
    return (
        <div className="w-dvw h-dvh flex items-center justify-center">
            {ytMode && <DynamicIsland />}
            <AudioAnalysisProvider
                noOfBands={40}
                children={<VisualizerPage />}
            />
            <ControlBar />
        </div>
    );
};

export default App;
