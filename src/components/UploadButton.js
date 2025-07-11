import React, { useEffect, useRef, useState } from 'react';
import Uppy from '@uppy/core';
import { Dashboard } from '@uppy/react';
import ThumbnailGenerator from '@uppy/thumbnail-generator';
import AwsS3 from '@uppy/aws-s3';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';

function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
  return new Blob([u8arr], { type: mime });
}

export default function UploadButton({ onUploadComplete }) {
  const uppyRef = useRef();
  const [ready, setReady] = useState(false);
  // Store thumbnail blobs by file ID
  const thumbnailBlobs = useRef({});

  useEffect(() => {
    const uppy = new Uppy({
      autoProceed: false,
      restrictions: {
        // allowedFileTypes: ['image/*', 'video/*'],
      },
    })
      .use(ThumbnailGenerator, {
        thumbnailWidth: 200,
        waitForThumbnailsBeforeUpload: false,
      })
      .use(AwsS3, {
        async getUploadParameters(file) {
          const token = localStorage.getItem('token');
          // If image, request thumbnail upload URL too
          const isImage = file.type.startsWith('image/');
          const hasThumb = isImage && thumbnailBlobs.current[file.id];
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              filename: file.name,
              mimeType: file.type,
              size: file.size,
              width: file.meta?.width,
              height: file.meta?.height,
              takenAt: file.meta?.takenAt,
              isImage,
              thumbnail: hasThumb ? true : undefined,
            }),
          });
          const data = await res.json();
          // If thumbnail, upload it now
          if (hasThumb && data.thumbnailUrl) {
            await fetch(data.thumbnailUrl, {
              method: 'PUT',
              headers: { 'Content-Type': 'image/jpeg' },
              body: thumbnailBlobs.current[file.id],
            });
          }
          return {
            method: 'PUT',
            url: data.uploadUrl,
            fields: {},
            headers: {
              'Content-Type': file.type,
            },
          };
        },
      });

    uppy.on('thumbnail:generated', (file, preview) => {
      // Store the thumbnail blob for this file
      thumbnailBlobs.current[file.id] = dataURLtoBlob(preview);
    });

    uppy.on('complete', (result) => {
      if (onUploadComplete) onUploadComplete(result);
      thumbnailBlobs.current = {}; // clear after upload
    });

    uppyRef.current = uppy;
    setReady(true);
    return () => uppy.destroy();
  }, [onUploadComplete]);

  return (
    <div>
      {ready && (
        <Dashboard
          uppy={uppyRef.current}
          proudlyDisplayPoweredByUppy={false}
          height={400}
          showProgressDetails
        />
      )}
    </div>
  );
} 