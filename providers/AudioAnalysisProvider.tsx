"use client";

import { createFrequencyBands, getBandEnergy } from "@/lib/band";
import { useAudioCaptureStore } from "@/store/audioCapture";
import { createContext, useContext, useEffect, useRef } from "react";

type AudioAnalysisProviderProps = {
  children: React.ReactNode;
  noOfBands?: number;
};

type AudioAnalysisProviderState = {
  bandsRef: React.MutableRefObject<Float32Array> | null;
};

const initialState: AudioAnalysisProviderState = {
  bandsRef: null,
};

const AudioAnalysisContext =
  createContext<AudioAnalysisProviderState>(initialState);

export function AudioAnalysisProvider({
  children,
  noOfBands = 20,
  ...props
}: AudioAnalysisProviderProps) {
  const { mediaStream } = useAudioCaptureStore();
  const bandsRef = useRef<Float32Array>(new Float32Array(noOfBands));
  const value = { bandsRef };

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const BANDS = createFrequencyBands(noOfBands, 20, 14000);

  useEffect(() => {
    if (!mediaStream) return;

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(mediaStream);

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;

    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    audioCtxRef.current = audioCtx;
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    return () => {
      audioCtx.close();
    };
  }, [mediaStream]);

  useEffect(() => {
    if (!mediaStream) {
      bandsRef.current = new Float32Array(noOfBands);
      return;
    }
    if (!analyserRef.current || !dataArrayRef.current || !audioCtxRef.current)
      return;

    const analyser = analyserRef.current;
    const data = dataArrayRef.current;
    const ctx = audioCtxRef.current;

    let rafId: number;

    const tick = () => {
      analyser.getByteFrequencyData(data as Uint8Array<ArrayBuffer>);
      if (!bandsRef || bandsRef.current === null) {
        return;
      }

      const newBandVals = BANDS.map((hz) =>
        getBandEnergy(data, ctx.sampleRate, analyser.fftSize, hz[0], hz[1]),
      );

      bandsRef.current.set(new Float32Array(newBandVals));

      rafId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(rafId);
  }, [mediaStream]);

  return (
    <AudioAnalysisContext.Provider {...props} value={value}>
      {children}
    </AudioAnalysisContext.Provider>
  );
}

export const useAudioAnalysis = () => {
  const context = useContext(AudioAnalysisContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
