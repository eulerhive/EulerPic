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
      <div className="mb-6 flex items-center gap-4">
        <Button onClick={() => setDrawerOpen(true)} variant="default">Upload</Button>
        <Button onClick={handleSelectAll} variant="outline">{selected.length === media.length ? 'Unselect All' : 'Select All'}</Button>
        <Button onClick={handleDownload} variant="secondary" disabled={!selected.length}>Download</Button>
        <Button onClick={handleDelete} variant="destructive" disabled={!selected.length}>Delete</Button>
      </div>
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-2xl"
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
        <div>Loading...</div>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 py-2 px-1 font-bold text-lg border-b">{date}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
              {items.map(m => (
                <div key={m.id} className="relative">
                  <input
                    type="checkbox"
                    checked={selected.includes(m.id)}
                    onChange={() => handleSelect(m.id)}
                    className="absolute top-2 left-2 z-10 w-5 h-5 accent-primary"
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