import React, { useRef, useState, useEffect } from 'react';

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

export default function MediaCard({ media, url, mediaList, currentIndex }) {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [fullUrl, setFullUrl] = useState(null);
  const [modalIndex, setModalIndex] = useState(currentIndex || 0);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (modalOpen && mediaList && mediaList[modalIndex]) {
      (async () => {
        const full = await fetchPresignedUrl(mediaList[modalIndex].s3Key);
        setFullUrl(full);
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

  return (
    <>
      <div
        ref={ref}
        className="rounded bg-white dark:bg-gray-900 p-1 flex flex-col items-center cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 focus-within:bg-gray-50 dark:focus-within:bg-gray-800"
        onClick={handleOpen}
      >
        {visible ? (
          media.mimeType.startsWith('image') ? (
            <img src={url} alt={media.filename} className="w-full h-40 object-cover rounded mb-1" loading="lazy" />
          ) : (
            <video src={url} controls className="w-full h-40 object-cover rounded mb-1" preload="none" />
          )
        ) : (
          <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded mb-1" />
        )}
        <div className="text-xs truncate w-full text-center text-gray-600 dark:text-gray-400" title={media.filename}>{media.filename}</div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleClose}>
          <div className="bg-white dark:bg-gray-900 rounded max-w-2xl w-full p-4 relative flex flex-col items-center border border-gray-200 dark:border-gray-800" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-2xl font-bold text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={handleClose}>&times;</button>
            {fullUrl ? (
              currentMedia.mimeType.startsWith('image') ? (
                <img src={fullUrl} alt={currentMedia.filename} className="max-h-[60vh] w-auto mx-auto" />
              ) : (
                <video src={fullUrl} controls autoPlay className="max-h-[60vh] w-auto mx-auto" controlsList="nodownload" style={{ width: '100%' }} />
              )
            ) : (
              <div className="text-center py-10 text-gray-400">Loading...</div>
            )}
            <div className="mt-2 text-center text-xs text-gray-500">{currentMedia.filename}</div>
            <div className="flex items-center justify-between w-full mt-4">
              <button onClick={handlePrev} disabled={modalIndex === 0} className="text-2xl px-4 py-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Previous">&#8592;</button>
              <div className="flex-1" />
              <button onClick={handleNext} disabled={mediaList && modalIndex === mediaList.length - 1} className="text-2xl px-4 py-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Next">&#8594;</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 