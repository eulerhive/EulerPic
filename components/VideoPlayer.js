"use client";
import { useRef, useState } from "react";

export default function VideoPlayer({ src, poster }) {
  const videoRef = useRef();
  const [playing, setPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const handlePlay = () => {
    videoRef.current.play();
    setPlaying(true);
    setShowOverlay(false);
  };

  const handlePause = () => {
    setPlaying(false);
    setShowOverlay(true);
  };

  return (
    <div className="relative w-full h-full group">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover rounded-lg"
        controls={false}
        onPause={handlePause}
        onPlay={() => setPlaying(true)}
      />
      {showOverlay && (
        <button
          className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition rounded-lg"
          onClick={handlePlay}
        >
          <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.4)" />
            <polygon points="10,8 16,12 10,16" fill="white" />
          </svg>
        </button>
      )}
      {/* Custom controls */}
      {playing && (
        <button
          className="absolute bottom-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80"
          onClick={() => {
            videoRef.current.pause();
            setPlaying(false);
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" fill="white" />
            <rect x="9" y="9" width="2" height="6" fill="black" />
            <rect x="13" y="9" width="2" height="6" fill="black" />
          </svg>
        </button>
      )}
    </div>
  );
} 