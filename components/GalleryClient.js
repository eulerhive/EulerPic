"use client";
import UploadButton from "@/components/UploadButton";
import VideoPlayer from "@/components/VideoPlayer";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import ImagePreviewModal from "./ImagePreviewModal";

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "size-desc", label: "Largest First" },
  { value: "size-asc", label: "Smallest First" },
];
const FILTER_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "other", label: "Other" },
];
const GROUP_OPTIONS = [
  { value: "none", label: "No Grouping" },
  { value: "type", label: "Group by Type" },
  { value: "date", label: "Group by Date (Day)" },
];

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString();
}

export default function GalleryClient({ media }) {
  const router = useRouter();
  const [selected, setSelected] = useState([]);
  const [previewIdx, setPreviewIdx] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("date-desc");
  const [group, setGroup] = useState("none");

  const toggleSelect = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };
  const selectAll = () => setSelected(filteredSortedMedia.flatMap(m => m.items ? m.items.map(i => i.key) : m.key ? [m.key] : []));
  const clearSelection = () => setSelected([]);

  const handleDownload = async () => {
    for (const key of selected) {
      const item = media.find((m) => m.key === key);
      if (item) {
        const a = document.createElement("a");
        a.href = item.url;
        a.download = key.split("/").pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the selected items?")) return;
    for (const key of selected) {
      await fetch("/api/upload-url", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
    }
    clearSelection();
    router.refresh();
  };

  // Filtering, sorting, grouping logic
  const filteredSortedMedia = useMemo(() => {
    let filtered = media;
    if (filter !== "all") {
      filtered = filtered.filter(m => m.contentType === filter);
    }
    let sorted = [...filtered];
    switch (sort) {
      case "date-desc":
        sorted.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        break;
      case "date-asc":
        sorted.sort((a, b) => new Date(a.lastModified) - new Date(b.lastModified));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.key.localeCompare(b.key));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.key.localeCompare(a.key));
        break;
      case "size-desc":
        sorted.sort((a, b) => (b.size || 0) - (a.size || 0));
        break;
      case "size-asc":
        sorted.sort((a, b) => (a.size || 0) - (b.size || 0));
        break;
      default:
        break;
    }
    if (group === "type") {
      const groups = {};
      for (const m of sorted) {
        if (!groups[m.contentType]) groups[m.contentType] = [];
        groups[m.contentType].push(m);
      }
      return Object.entries(groups).map(([type, items]) => ({ group: type, items }));
    } else if (group === "date") {
      const groups = {};
      for (const m of sorted) {
        const date = formatDate(m.lastModified);
        if (!groups[date]) groups[date] = [];
        groups[date].push(m);
      }
      return Object.entries(groups).map(([date, items]) => ({ group: date, items }));
    } else {
      return sorted;
    }
  }, [media, filter, sort, group]);

  // For preview modal, flatten grouped media
  const flatMedia = useMemo(() => {
    if (Array.isArray(filteredSortedMedia)) {
      if (filteredSortedMedia.length && filteredSortedMedia[0].items) {
        return filteredSortedMedia.flatMap(g => g.items);
      }
      return filteredSortedMedia;
    }
    return [];
  }, [filteredSortedMedia]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Gallery</h1>
        <UploadButton onFiles={() => router.refresh()} />
      </div>
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-2 py-1 rounded border">
          {FILTER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} className="px-2 py-1 rounded border">
          {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select value={group} onChange={e => setGroup(e.target.value)} className="px-2 py-1 rounded border">
          {GROUP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {selected.length > 0 && (
          <>
            <button onClick={selectAll} className="px-2 py-1 bg-gray-200 rounded">Select All</button>
            <button onClick={clearSelection} className="px-2 py-1 bg-gray-200 rounded">Clear</button>
            <button onClick={handleDownload} className="px-2 py-1 bg-blue-500 text-white rounded">Download</button>
            <button onClick={handleDelete} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
          </>
        )}
      </div>
      {Array.isArray(filteredSortedMedia) && filteredSortedMedia.length && filteredSortedMedia[0].items ? (
        filteredSortedMedia.map(({ group, items }) => (
          <div key={group} className="mb-8">
            <div className="text-xl font-semibold mb-2 capitalize">{group}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map(({ key, url, isVideo, thumbUrl }, idx) => (
                <div key={key} className={`relative aspect-square bg-white rounded-lg shadow overflow-hidden group border-2 ${selected.includes(key) ? 'border-blue-500' : 'border-transparent'}`}> 
                  <input
                    type="checkbox"
                    checked={selected.includes(key)}
                    onChange={() => toggleSelect(key)}
                    className="absolute top-2 left-2 z-10 w-5 h-5"
                    onClick={e => e.stopPropagation()}
                  />
                  <div onClick={() => setPreviewIdx(flatMedia.findIndex(m => m.key === key))} className="cursor-pointer w-full h-full">
                    {isVideo ? (
                      <VideoPlayer src={url} />
                    ) : (
                      <img
                        src={thumbUrl || url}
                        alt="media"
                        className="w-full h-full object-cover group-hover:opacity-80 transition"
                        loading="lazy"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {flatMedia.length === 0 && (
            <div className="col-span-full text-center text-gray-400">No media uploaded yet.</div>
          )}
          {flatMedia.map(({ key, url, isVideo, thumbUrl }, idx) => (
            <div key={key} className={`relative aspect-square bg-white rounded-lg shadow overflow-hidden group border-2 ${selected.includes(key) ? 'border-blue-500' : 'border-transparent'}`}> 
              <input
                type="checkbox"
                checked={selected.includes(key)}
                onChange={() => toggleSelect(key)}
                className="absolute top-2 left-2 z-10 w-5 h-5"
                onClick={e => e.stopPropagation()}
              />
              <div onClick={() => setPreviewIdx(idx)} className="cursor-pointer w-full h-full">
                {isVideo ? (
                  <VideoPlayer src={url} />
                ) : (
                  <img
                    src={thumbUrl || url}
                    alt="media"
                    className="w-full h-full object-cover group-hover:opacity-80 transition"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {previewIdx !== null && (
        <ImagePreviewModal
          media={flatMedia}
          startIdx={previewIdx}
          onClose={() => setPreviewIdx(null)}
          selected={selected}
          toggleSelect={toggleSelect}
        />
      )}
    </div>
  );
}
