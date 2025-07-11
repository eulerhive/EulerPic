import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from "@heroicons/react/24/solid";

async function fetchPresignedUrl(s3Key) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ s3Key }),
  });
  const data = await res.json();
  return data.url;
}

// Module-level Set to track loaded images by s3Key
const loadedImages = new Set();
// Module-level Map to cache presigned preview URLs by s3Key
const previewUrlCache = new Map();

export default function MediaCard({ media, url, mediaList, currentIndex, onSelect, selected, onDelete, onDownload }) {
  const ref = useRef();
  // Initialize visible based on cache
  const [visible, setVisible] = useState(() => loadedImages.has(media.s3Key));
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [fullUrl, setFullUrl] = useState(null);
  const [modalIndex, setModalIndex] = useState(currentIndex || 0);
  const [hovered, setHovered] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgStart, setImgStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (loadedImages.has(media.s3Key)) {
      setVisible(true);
      return;
    }
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          loadedImages.add(media.s3Key);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [media.s3Key]);

  useEffect(() => {
    if (modalOpen && mediaList && mediaList[modalIndex]) {
      (async () => {
        const s3Key = mediaList[modalIndex].s3Key;
        if (previewUrlCache.has(s3Key)) {
          setFullUrl(previewUrlCache.get(s3Key));
        } else {
          const full = await fetchPresignedUrl(s3Key);
          previewUrlCache.set(s3Key, full);
          setFullUrl(full);
        }
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      })();
    }
  }, [modalOpen, modalIndex, mediaList]);

  const handleOpen = () => {
    setModalIndex(currentIndex || 0);
    setModalOpen(true);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleClose = () => {
    setModalOpen(false);
    setFullUrl(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setModalIndex(i => (i > 0 ? i - 1 : i));
  };
  const handleNext = (e) => {
    e.stopPropagation();
    setModalIndex(i => (mediaList && i < mediaList.length - 1 ? i + 1 : i));
  };

  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev(e);
      if (e.key === 'ArrowRight') handleNext(e);
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen, mediaList]);

  const currentMedia = mediaList ? mediaList[modalIndex] : media;

  // Overlay action handlers
  const handleSelect = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(media.id);
  };
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (onDelete) await onDelete(media.id);
  };
  const handleDownload = async (e) => {
    e.stopPropagation();
    if (onDownload) await onDownload(media.id);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 1));
  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Pan controls
  const handleMouseDown = (e) => {
    if (zoom === 1) return;
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setImgStart({ ...position });
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPosition({ x: imgStart.x + dx, y: imgStart.y + dy });
  };
  const handleMouseUp = () => setDragging(false);

  // Mouse wheel zoom
  const handleWheel = (e) => {
    if (!modalOpen) return;
    e.preventDefault();
    let newZoom = zoom - e.deltaY * 0.0015; // scroll up = zoom in
    newZoom = Math.max(1, Math.min(3, newZoom));
    setZoom(newZoom);
    if (newZoom === 1) setPosition({ x: 0, y: 0 });
  };

  // Touch events for mobile
  const handleTouchStart = (e) => {
    if (zoom === 1) return;
    if (e.touches.length === 1) {
      setDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setImgStart({ ...position });
    }
  };
  const handleTouchMove = (e) => {
    if (!dragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    setPosition({ x: imgStart.x + dx, y: imgStart.y + dy });
  };
  const handleTouchEnd = () => setDragging(false);

  return (
    <>
      <Card
        ref={ref}
        className="relative p-1 flex flex-col items-center cursor-pointer group"
        onClick={handleOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Selector always visible in top-right */}
        <div className="absolute top-2 right-2 z-20">
          <Button
            onClick={handleSelect}
            variant={selected ? 'default' : 'outline'}
            size="sm"
            aria-label={selected ? 'Unselect' : 'Select'}
            className="rounded-full border-1 border-primary bg-white/80 dark:bg-gray-900/80 h-6 w-6"
            icon={selected ? (
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : null}
          />
        </div>
        {/* Media preview */}
        <div className="w-full h-40 relative mb-1">
          {!loaded && <div className="absolute inset-0 w-full h-full bg-gray-800 animate-pulse rounded-lg z-10" />}
          {visible && media.mimeType.startsWith('image') && (
            <img
              src={url}
              alt={media.filename}
              className={`w-full h-40 object-cover rounded-lg transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setLoaded(true)}
            />
          )}
          {visible && !media.mimeType.startsWith('image') && (
            <video
              src={url}
              controls
              className={`w-full h-40 object-cover rounded-lg transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
              preload="none"
              onLoadedData={() => setLoaded(true)}
            />
          )}
        </div>
        {/* Filename */}
        <div className="text-xs truncate w-full text-center text-gray-400" title={media.filename}>{media.filename}</div>
      </Card>
      {/* Modal preview */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleClose}
          onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        >
          <div className="bg-gray-900 rounded-xl max-w-5xl w-full p-4 relative flex flex-col items-center border border-gray-800" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-2xl font-bold text-gray-400 hover:text-gray-200" onClick={handleClose}>&times;</button>
            {/* Zoom controls */}
            <div className="absolute top-2 left-2 flex gap-2 z-10">
              <button onClick={handleZoomOut} className="rounded bg-gray-700 text-white px-2 py-1 text-lg font-bold hover:bg-gray-600" aria-label="Zoom out" disabled={zoom <= 1}>−</button>
              <button onClick={handleZoomIn} className="rounded bg-gray-700 text-white px-2 py-1 text-lg font-bold hover:bg-gray-600" aria-label="Zoom in" disabled={zoom >= 3}>+</button>
              <button onClick={handleResetZoom} className="rounded bg-gray-700 text-white px-2 py-1 text-sm font-bold hover:bg-gray-600" aria-label="Reset zoom" disabled={zoom === 1}>Reset</button>
            </div>
            {fullUrl ? (
              currentMedia.mimeType.startsWith('image') ? (
                <div
                  tabIndex={0}
                  className="max-h-[70vh] max-w-full w-auto h-auto mx-auto rounded-lg overflow-hidden flex items-center justify-center outline-none"
                  style={{ cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default', outline: 'none' }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onWheel={handleWheel}
                >
                  <img
                    src={fullUrl}
                    alt={currentMedia.filename}
                    className="select-none pointer-events-auto"
                    style={{
                      transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                      transition: dragging ? 'none' : 'transform 0.2s',
                      maxHeight: '70vh',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      userSelect: 'none',
                    }}
                    draggable={false}
                  />
                </div>
              ) : (
                <div
                  tabIndex={0}
                  className="max-h-[70vh] max-w-full w-auto h-auto mx-auto rounded-lg overflow-hidden flex items-center justify-center outline-none"
                  style={{ cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default', outline: 'none' }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onWheel={handleWheel}
                >
                  <video
                    src={fullUrl}
                    controls
                    autoPlay
                    className="select-none pointer-events-auto"
                    controlsList="nodownload"
                    style={{
                      transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                      transition: dragging ? 'none' : 'transform 0.2s',
                      maxHeight: '70vh',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      userSelect: 'none',
                    }}
                    draggable={false}
                  />
                </div>
              )
            ) : (
              <div className="text-center py-10 text-gray-400">Loading...</div>
            )}
            <div className="mt-2 text-center text-xs text-gray-400 truncate w-full" title={currentMedia.filename}>{currentMedia.filename}</div>
            <div className="flex items-center justify-center gap-4 w-full mt-4">
              <button onClick={handlePrev} disabled={modalIndex === 0} className="text-2xl px-4 py-2 text-gray-400 hover:text-gray-200" aria-label="Previous">&#8592;</button>
              <button onClick={() => handleDownload({ stopPropagation: () => {} })} className="rounded bg-primary text-white px-3 py-1 text-sm font-semibold hover:bg-primary/90">Download</button>
              <button onClick={() => handleDelete({ stopPropagation: () => {} })} className="rounded bg-red-600 text-white px-3 py-1 text-sm font-semibold hover:bg-red-700">Delete</button>
              <button onClick={handleNext} disabled={mediaList && modalIndex === mediaList.length - 1} className="text-2xl px-4 py-2 text-gray-400 hover:text-gray-200" aria-label="Next">&#8594;</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 