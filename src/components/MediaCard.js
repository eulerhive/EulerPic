import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [fullUrl, setFullUrl] = useState(null);
  const [modalIndex, setModalIndex] = useState(currentIndex || 0);
  const [hovered, setHovered] = useState(false);

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
      })();
    }
  }, [modalOpen, modalIndex, mediaList]);

  const handleOpen = () => {
    setModalIndex(currentIndex || 0);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setFullUrl(null);
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
    toast.success('Deleted!');
  };
  const handleDownload = async (e) => {
    e.stopPropagation();
    if (onDownload) await onDownload(media.id);
    toast.success('Download started!');
  };

  return (
    <>
      <div
        ref={ref}
        className={
          `relative rounded-xl bg-gray-900 border border-gray-800 p-1 flex flex-col items-center cursor-pointer shadow-md transition-all hover:scale-[1.025] hover:shadow-lg focus-within:bg-gray-800 group`
        }
        onClick={handleOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Overlay controls */}
        <div className={`absolute top-2 right-2 flex flex-col gap-2 z-20 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} md:opacity-0 md:group-hover:opacity-100`}>
          <button onClick={handleSelect} className={`rounded-full p-1 bg-gray-800/80 hover:bg-primary focus:outline-none border-2 ${selected ? 'border-primary' : 'border-gray-700'}`} title={selected ? 'Unselect' : 'Select'}>
            {/* Check/Select icon */}
            {selected ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /></svg>
            )}
          </button>
          <button onClick={handleDownload} className="rounded-full p-1 bg-gray-800/80 hover:bg-primary focus:outline-none border-2 border-gray-700" title="Download">
            {/* Download icon */}
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4" /></svg>
          </button>
          <button onClick={handleDelete} className="rounded-full p-1 bg-gray-800/80 hover:bg-red-600 focus:outline-none border-2 border-gray-700" title="Delete">
            {/* Delete icon */}
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {/* Media preview */}
        {visible ? (
          media.mimeType.startsWith('image') ? (
            <img src={url} alt={media.filename} className="w-full h-40 object-cover rounded-lg mb-1" loading="lazy" />
          ) : (
            <video src={url} controls className="w-full h-40 object-cover rounded-lg mb-1" preload="none" />
          )
        ) : (
          <div className="w-full h-40 bg-gray-800 animate-pulse rounded-lg mb-1" />
        )}
        {/* Filename */}
        <div className="text-xs truncate w-full text-center text-gray-400" title={media.filename}>{media.filename}</div>
      </div>
      {/* Modal preview */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleClose}>
          <div className="bg-gray-900 rounded-xl max-w-5xl w-full p-4 relative flex flex-col items-center border border-gray-800" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-2xl font-bold text-gray-400 hover:text-gray-200" onClick={handleClose}>&times;</button>
            {fullUrl ? (
              currentMedia.mimeType.startsWith('image') ? (
                <img src={fullUrl} alt={currentMedia.filename} className="max-h-[70vh] max-w-full w-auto h-auto mx-auto rounded-lg" style={{ objectFit: 'contain' }} />
              ) : (
                <video src={fullUrl} controls autoPlay className="max-h-[70vh] max-w-full w-auto h-auto mx-auto rounded-lg" controlsList="nodownload" style={{ objectFit: 'contain' }} />
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