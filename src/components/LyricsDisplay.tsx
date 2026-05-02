import React, { useEffect, useRef } from 'react';
import { useLyricsStore } from '@/store/lyricsStore';
import { usePlaybackStore } from '@/store/playbackStore';
import { motion } from "framer-motion";

import { useAppStore } from '@/store/appStore';

const LyricsDisplay: React.FC = () => {
  const { lyrics, isLoading } = useLyricsStore();
  const { currentTime } = usePlaybackStore();
  const { ytMode } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentLineIndex = lyrics?.lines.findIndex((line, index) => {
    const nextLine = lyrics.lines[index + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  }) ?? -1;

  useEffect(() => {
    if (scrollRef.current && currentLineIndex !== -1) {
      const activeLine = scrollRef.current.children[currentLineIndex] as HTMLElement;
      if (activeLine) {
        activeLine.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentLineIndex]);

  if (!ytMode || (!lyrics && !isLoading)) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="w-full max-w-2xl px-8 h-[60vh] flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="text-white/50 animate-pulse font-medium text-xl">Loading lyrics...</div>
        ) : (
          <div 
            ref={scrollRef}
            className="w-full space-y-6 overflow-hidden flex flex-col items-center py-[30vh]"
          >
            {lyrics?.lines.map((line, index) => {
              const isActive = index === currentLineIndex;
              const isPast = index < currentLineIndex;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: isActive ? 1 : (isPast ? 0.3 : 0.15),
                    scale: isActive ? 1.1 : 0.95,
                    filter: isActive ? 'blur(0px)' : 'blur(1px)',
                    y: 0
                  }}
                  transition={{ duration: 0.4 }}
                  className={`text-center font-bold text-2xl md:text-4xl transition-all duration-500 max-w-full break-words px-4 ${
                    isActive ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'text-white/60'
                  }`}
                >
                  {line.text}
                </motion.div>
              );
            })}
            {lyrics?.lines.length === 0 && !isLoading && (
               <div className="text-white/20 italic text-xl">Instrumental or lyrics unavailable</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LyricsDisplay;
