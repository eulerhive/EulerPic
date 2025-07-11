import React, { useEffect, useRef } from "react";

export default function ImagePreviewModal({ media, startIdx, onClose, selected, toggleSelect }) {
  const [idx, setIdx] = React.useState(startIdx);
  const item = media[idx];
  const focusRef = useRef(null);

  useEffect(() => {
    if (focusRef.current) focusRef.current.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % media.length);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + media.length) % media.length);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [media.length, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      role="dialog"
      aria-modal="true"
      aria-label="Media preview modal"
    >
      {/* Hidden button for focus trap and keyboard accessibility */}
      <button ref={focusRef} style={{position: 'absolute', left: '-9999px'}} aria-hidden="true" tabIndex={0}></button>
      <button onClick={onClose} className="absolute top-4 right-8 text-white text-4xl z-50" aria-label="Close preview">×</button>
      <button
        onClick={() => setIdx((i) => (i - 1 + media.length) % media.length)}
        className="absolute left-8 top-1/2 -translate-y-1/2 text-white text-5xl px-2 z-50"
        aria-label="Previous media"
        tabIndex={0}
      >&#8592;</button>
      <button
        onClick={() => setIdx((i) => (i + 1) % media.length)}
        className="absolute right-8 top-1/2 -translate-y-1/2 text-white text-5xl px-2 z-50"
        aria-label="Next media"
        tabIndex={0}
      >&#8594;</button>
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center z-50">
        <input
          type="checkbox"
          checked={selected.includes(item.key)}
          onChange={() => toggleSelect(item.key)}
          className="w-6 h-6 mr-2"
          id="select-image"
          tabIndex={0}
        />
        <label htmlFor="select-image" className="text-white text-lg">Select</label>
      </div>
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          {item.isVideo ? (
            <video src={item.url} controls className="max-w-full max-h-full w-auto h-auto object-contain bg-black" style={{width: '100vw', height: '100vh'}} tabIndex={0} />
          ) : (
            <img src={item.url} alt="preview" className="max-w-full max-h-full w-auto h-auto object-contain bg-black" style={{width: '100vw', height: '100vh'}} tabIndex={0} />
          )}
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-center z-50">
        <div className="mb-2 text-lg">{item.key.split("/").pop()}</div>
        <div className="text-base">
          {idx + 1} / {media.length}
        </div>
      </div>
    </div>
  );
} 