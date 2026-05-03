import { create } from "zustand";

interface AudioCaptureStore {
    isCapturing: boolean;
    error: string | null;
    mediaStream: MediaStream | null;
    startScreenCapture: () => Promise<void>;
    startTabCapture: () => Promise<void>;
    cleanup: () => void;
}

export const useAudioCaptureStore = create<AudioCaptureStore>((set, get) => ({
    isCapturing: false,
    error: null,
    mediaStream: null,
    startScreenCapture: async () => {
        try {
            get().cleanup();

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });

            const videoStream = stream.getVideoTracks()[0];
            if (!videoStream) {
                throw new Error("No video track found");
            }
            set({ mediaStream: stream, isCapturing: true, error: null });
            videoStream.onended = () => {
                get().cleanup();
            };
        } catch (error) {
            set({
                mediaStream: null,
                isCapturing: false,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },
    startTabCapture: async () => {
        try {
            get().cleanup();
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: "browser",
                },
                audio: {
                    suppressLocalAudioPlayback: false,
                } as any,
                // @ts-expect-error: preferCurrentTab is a newer property
                preferCurrentTab: true,
            });

            set({ mediaStream: stream, isCapturing: true, error: null });

            stream.getVideoTracks()[0].onended = () => {
                get().cleanup();
            };
        } catch (error) {
            set({
                mediaStream: null,
                isCapturing: false,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },
    cleanup: () => {
        get()
            .mediaStream?.getTracks()
            .forEach((track) => track.stop());
        set({ mediaStream: null, isCapturing: false, error: null });
    },
}));
