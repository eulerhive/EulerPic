import React, { useEffect, useState, useCallback } from 'react';
import MediaCard from './MediaCard';
import UploadButton from './UploadButton';
import { Button } from './ui/button';
import JSZip from 'jszip';

function groupByDate(media) {
  return media.reduce((acc, item) => {
    const date = new Date(item.takenAt || item.createdAt);
    const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

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

export default function MediaGrid() {
  const [media, setMedia] = useState([]);
  const [urls, setUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  // Use useCallback to keep the same function reference
  const fetchMedia = useCallback(async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/media', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMedia(data.media || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchMedia();
  }, [fetchMedia]);

  useEffect(() => {
    async function fetchUrls() {
      const entries = await Promise.all(
        media.map(async m => {
          const key = m.thumbnailKey || m.s3Key;
          const url = await fetchPresignedUrl(key);
          return [m.id, url];
        })
      );
      setUrls(Object.fromEntries(entries));
    }
    if (media.length) fetchUrls();
  }, [media]);

  const grouped = groupByDate(media);

  const handleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selected.length === media.length) setSelected([]);
    else setSelected(media.map(m => m.id));
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    await Promise.all(selected.map(async id => {
      const m = media.find(x => x.id === id);
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ filename: m.filename }),
      });
    }));
    setSelected([]);
    fetchMedia();
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    await Promise.all(selected.map(async id => {
      const m = media.find(x => x.id === id);
      const url = await fetchPresignedUrl(m.s3Key);
      const res = await fetch(url);
      const blob = await res.blob();
      zip.file(m.filename, blob);
    }));
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'media.zip';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Button onClick={() => setDrawerOpen(true)} variant="default" className="min-w-[90px] h-9 font-semibold">Upload</Button>
        <Button onClick={handleSelectAll} variant="outline" className="min-w-[90px] h-9 font-semibold">{selected.length === media.length ? 'Unselect All' : 'Select All'}</Button>
        <Button onClick={handleDownload} variant="secondary" disabled={!selected.length} className="min-w-[90px] h-9 font-semibold">Download</Button>
        <Button onClick={handleDelete} variant="destructive" disabled={!selected.length} className="min-w-[90px] h-9 font-semibold">Delete</Button>
      </div>
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 w-full max-w-md relative border border-gray-200 dark:border-gray-800">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <UploadButton onUploadComplete={() => { setDrawerOpen(false); fetchMedia(); }} />
          </div>
        </div>
      )}
      {loading ? (
        <div className="text-center text-gray-400 py-10">Loading...</div>
      ) : media.length === 0 ? (
        <div className="text-center text-gray-400 py-16 text-lg">No media yet. Upload your first photo or video!</div>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <div className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 py-2 px-1 font-bold text-base border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">{date}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-8 py-4">
              {items.map(m => (
                <div key={m.id} className="relative group transition-transform duration-150 hover:scale-[1.025] hover:shadow-md">
                  <input
                    type="checkbox"
                    checked={selected.includes(m.id)}
                    onChange={() => handleSelect(m.id)}
                    className="absolute top-2 left-2 z-10 w-4 h-4 accent-primary bg-white border border-gray-300 rounded opacity-60 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150"
                    onClick={e => e.stopPropagation()}
                  />
                  <MediaCard media={m} url={urls[m.id]} mediaList={media} currentIndex={media.findIndex(x => x.id === m.id)} />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
} 