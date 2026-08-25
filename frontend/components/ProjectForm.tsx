"use client";

import { useState, useEffect } from "react";

type Props = {
  initialData?: any | null;
  onSave: (data: any) => Promise<void> | void;
  onCancel: () => void;
};

export default function ProjectForm({ initialData, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "AI + UGC");
  const [tags, setTags] = useState((initialData?.tags ?? []).join?.(", ") ?? "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlPreview, setVideoUrlPreview] = useState(initialData?.video_url ?? "");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(initialData?.thumbnail_url ?? "");
  const [isFeatured, setIsFeatured] = useState(!!initialData?.is_featured);
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order ?? 0);

  useEffect(() => {
    if (!videoFile) return;
    const url = URL.createObjectURL(videoFile);
    setVideoUrlPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  useEffect(() => {
    if (!thumbnailFile) return;
    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnailFile]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data: any = {
          title,
          category,
          tags,
          is_featured: isFeatured,
          display_order: displayOrder,
        };
        if (videoFile) data.videoFile = videoFile;
        if (thumbnailFile) data.thumbnailFile = thumbnailFile;
        // if editing and no new files provided, include existing urls
        if (initialData?.id) data.id = initialData.id;
        if (!videoFile && initialData?.video_url) data.video_url = initialData.video_url;
        if (!thumbnailFile && initialData?.thumbnail_url) data.thumbnail_url = initialData.thumbnail_url;
        onSave(data);
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700 md:col-span-2">
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5">
            <option>AI + UGC</option>
            <option>B-Roll + VO</option>
            <option>AI Creatives</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Tags (comma-separated)
          <input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Display order
          <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
        </label>

        <label className="block text-sm font-medium text-slate-700 md:col-span-2">
          Video file (MP4)
          <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
        </label>

        {videoUrlPreview && (
          <div className="md:col-span-2">
            <p className="text-xs text-neutral-600">Video preview</p>
            <video src={videoUrlPreview} controls className="mt-2 w-full max-h-48 rounded-md" />
          </div>
        )}

        <label className="block text-sm font-medium text-slate-700 md:col-span-2">
          Thumbnail (optional)
          <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files ? e.target.files[0] : null)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
        </label>

        {thumbnailPreview && (
          <div className="md:col-span-2">
            <p className="text-xs text-neutral-600">Thumbnail preview</p>
            <img src={thumbnailPreview} alt="thumbnail" className="mt-2 w-48 rounded-md" />
          </div>
        )}

        <label className="flex items-center gap-3 md:col-span-2">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          <span className="text-sm text-slate-700">Featured (max 2)</span>
        </label>

        <div className="md:col-span-2 flex items-center gap-3">
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save project</button>
          <button type="button" onClick={onCancel} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
        </div>
      </div>
    </form>
  );
}
