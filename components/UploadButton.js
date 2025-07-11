"use client";
import { useRef, useState, useEffect } from "react";
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import AwsS3Multipart from '@uppy/aws-s3-multipart';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';

export default function UploadButton({ onFiles }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [fileProgress, setFileProgress] = useState([]); // [{name, progress, status}]
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [uppyInstance, setUppyInstance] = useState(null);

  const handleFileChange = async (e) => {
    setError(null);
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setFileProgress(files.map(f => ({ name: f.name, progress: 0, status: 'uploading' })));
    try {
      await Promise.all(
        files.map((file, idx) => {
          return new Promise(async (resolve, reject) => {
            // Get signed URL from API
            const res = await fetch("/api/s3-signed-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ filename: file.name, type: file.type }),
            });
            if (!res.ok) {
              setFileProgress(prev => {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], status: 'error' };
                return updated;
              });
              reject(new Error("Failed to get upload URL"));
              return;
            }
            const { url, key } = await res.json();
            // Upload file directly to S3
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", url);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                setFileProgress(prev => {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], progress: Math.round((event.loaded / event.total) * 100) };
                  return updated;
                });
              }
            };
            xhr.onload = () => {
              if (xhr.status === 200) {
                setFileProgress(prev => {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], progress: 100, status: 'done' };
                  return updated;
                });
                resolve();
              } else {
                setFileProgress(prev => {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], status: 'error' };
                  return updated;
                });
                reject(new Error("Upload failed"));
              }
            };
            xhr.onerror = () => {
              setFileProgress(prev => {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], status: 'error' };
                return updated;
              });
              reject(new Error("Upload error"));
            };
            xhr.send(file);
          });
        })
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      inputRef.current.value = "";
      setTimeout(() => setFileProgress([]), 2000); // Clear progress after 2s
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const uppy = new Uppy({
      id: 'gallery-uppy',
      autoProceed: false,
      allowMultipleUploads: true,
      debug: true,
      restrictions: {
        maxNumberOfFiles: null,
        allowedFileTypes: ['image/*', 'video/mp4', 'video/quicktime'],
      },
      meta: {},
    })
      .use(Dashboard, {
        trigger: null,
        inline: true,
        closeAfterFinish: false,
        showProgressDetails: true,
        proudlyDisplayPoweredByUppy: false,
        note: 'Images and videos only',
        height: '100%',
      })
      .use(AwsS3Multipart, {
        endpoint: '/api/s3-multipart',
        shouldUseMultipart: true,
        createMultipartUpload: async (file) => {
          const res = await fetch('/api/s3-multipart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, type: file.type }),
          });
          if (!res.ok) throw new Error('Failed to create multipart upload');
          return res.json();
        },
        listParts: async (file, { key, uploadId }) => {
          const url = `/api/s3-multipart?key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}`;
          const res = await fetch(url, { method: 'GET' });
          if (!res.ok) throw new Error('Failed to list parts');
          return res.json();
        },
        completeMultipartUpload: async (file, { key, uploadId, parts }) => {
          const res = await fetch('/api/s3-multipart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, uploadId, parts }),
          });
          if (!res.ok) throw new Error('Failed to complete upload');
          return res.json();
        },
        abortMultipartUpload: async (file, { key, uploadId }) => {
          const res = await fetch('/api/s3-multipart', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, uploadId }),
          });
          if (!res.ok) throw new Error('Failed to abort upload');
          return res.json();
        },
        prepareUploadParts: async (file, { key, uploadId, parts }) => {
          console.log('prepareUploadParts called', { key, uploadId, parts });
          const res = await fetch('/api/s3-signed-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, uploadId, parts }),
          });
          if (!res.ok) throw new Error('Failed to get signed URLs for parts');
          return res.json(); // should return { urls: [ ... ] }
        },
        signPart: async () => ({}),
      });

    setUppyInstance(uppy);

    return () => {
      uppy.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/mp4,video/quicktime"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setDrawerOpen(true)}
        disabled={uploading}
      >
        {uploading ? `Uploading...` : "Upload"}
      </button>
      <div className="w-full flex flex-col gap-1">
        {fileProgress.map((f, i) => (
          <div key={f.name} className="w-full flex flex-col items-start">
            <span className="text-xs text-gray-700">{f.name} {f.status === 'done' ? '✓' : f.status === 'error' ? '✗' : ''}</span>
            <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
              <div
                className={`h-2 rounded ${f.status === 'error' ? 'bg-red-400' : 'bg-blue-500'}`}
                style={{ width: `${f.progress}%`, transition: 'width 0.2s' }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {uppyInstance && (
        <UppyDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} uppy={uppyInstance} />
      )}
    </div>
  );
}

function UppyDrawer({ open, onClose, uppy }) {
  const dashboardRef = useRef();

  useEffect(() => {
    if (open && uppy && dashboardRef.current) {
      uppy.getPlugin('Dashboard').mount(dashboardRef.current, {
        inline: true,
        target: dashboardRef.current,
        height: '100%',
      });
    }
    return () => {
      if (uppy && dashboardRef.current) {
        uppy.getPlugin('Dashboard').unmount();
      }
    };
  }, [open, uppy]);

  if (!open) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50 flex flex-col border-l border-gray-200">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="font-semibold">Uploads</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">×</button>
      </div>
      <div ref={dashboardRef} className="flex-1 overflow-y-auto p-2" style={{ minHeight: 0 }} />
    </div>
  );
} 