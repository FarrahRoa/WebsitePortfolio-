"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Database } from "../../backend/types/database.types";

import HomeContentEditor from "./HomeContentEditor";
import AboutContentEditor from "./AboutContentEditor";
import ContactContentEditor from "./ContactContentEditor";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

type VideoSource = "upload" | "external";

type ProjectFormState = {
  title: string;
  category: string;
  tags: string;
  is_featured: boolean;
  videoFile: File | null;
  videoUrl: string;
  videoSource: VideoSource;
};

type ToolRow = Database["public"]["Tables"]["tools"]["Row"];

type ToolFormState = {
  name: string;
  icon_url: string;
  display_order: number;
};

function validateExternalVideoUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
    const path = url.pathname.toLowerCase();

    const isCloudinary = hostname.endsWith("res.cloudinary.com") || hostname.endsWith("cloudinary.com");
    if (isCloudinary) return trimmed;

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (path === "/watch" && url.searchParams.get("v")) return trimmed;
      if (path.startsWith("/embed/") && url.pathname.split("/").filter(Boolean)[1]) return trimmed;
      return null;
    }

    if (hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean).length > 0 ? trimmed : null;
    }

    if (hostname === "vimeo.com") {
      return url.pathname.split("/").filter(Boolean).length > 0 ? trimmed : null;
    }

    return null;
  } catch {
    return null;
  }
}

export default function AdminDashboardClient({ cloudName }: { cloudName?: string | null } = {}) {
  const [fileUrl, setFileUrl] = useState<string>("");
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);
  const [selectedResumeName, setSelectedResumeName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [videoValidationError, setVideoValidationError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const uploadAbortRef = useRef<AbortController | null>(null);

  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [projectForm, setProjectForm] = useState<ProjectFormState>({
    title: "",
    category: "",
    tags: "",
    is_featured: false,
    videoFile: null,
    videoUrl: "",
    videoSource: "upload",
  });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [toolForm, setToolForm] = useState<ToolFormState>({ name: "", icon_url: "", display_order: 1 });
  const [tools, setTools] = useState<ToolRow[]>([]);
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  const [toolMessage, setToolMessage] = useState<string | null>(null);
  const [toolSaving, setToolSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<"home" | "about" | "portfolio" | "tools" | "resume" | "contact">("resume");

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      try {
        const { data, error } = (await (supabase.from("resume") as any).select("*").limit(1).maybeSingle()) as {
          data: Database["public"]["Tables"]["resume"]["Row"] | null;
          error: { message: string } | null;
        };
        if (error) {
          console.error("Failed to load resume row:", error);
          setMessage("Failed to load resume data");
          return;
        }

        setResumeId(data?.id ?? null);
        setFileUrl(data?.file_url ?? "");

        try {
          const { data: projData, error: projError } = (await (supabase.from("projects") as any).select("*").order("display_order", { ascending: true })) as {
            data: ProjectRow[] | null;
            error: { message: string } | null;
          };
          if (projError) {
            console.error("Failed to load projects:", projError);
          } else {
            setProjects(projData ?? []);
          }
        } catch (projErr) {
          console.error("Unexpected error loading projects:", projErr);
        }

        try {
          const { data: toolData, error: toolError } = (await (supabase.from("tools") as any).select("*").order("display_order", { ascending: true })) as {
            data: ToolRow[] | null;
            error: { message: string } | null;
          };
          if (toolError) {
            console.error("Failed to load tools:", toolError);
          } else {
            setTools(toolData ?? []);
          }
        } catch (toolErr) {
          console.error("Unexpected error loading tools:", toolErr);
        }
      } catch (err) {
        console.error(err);
        setMessage("Unexpected error loading resume");
      }
    }

    load();
  }, []);

  function handleResumeFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setSelectedResumeFile(null);
      setSelectedResumeName(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setMessage("Please select a PDF file.");
      setSelectedResumeFile(null);
      setSelectedResumeName(null);
      return;
    }

    setSelectedResumeFile(file);
    setSelectedResumeName(file.name);
    setMessage(null);
  }

  async function uploadSelectedResume() {
    if (!selectedResumeFile) {
      setMessage("Please select a PDF to upload.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const safeName = selectedResumeFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const uniqueId = crypto.randomUUID();
      const path = `resumes/${uniqueId}-${safeName}`;

      const { error: uploadError } = await supabase.storage.from("resumes").upload(path, selectedResumeFile, { upsert: true });
      if (uploadError) {
        console.error("Upload error:", uploadError);
        setMessage("Failed to upload resume file");
        setLoading(false);
        return;
      }

      const { data: publicData } = supabase.storage.from("resumes").getPublicUrl(path);
      const publicUrl = publicData?.publicUrl ?? "";

      if (!publicUrl) {
        setMessage("Uploaded but failed to obtain public URL");
        setLoading(false);
        return;
      }

      await handleSaveResumeUrl(publicUrl);
      setFileUrl(publicUrl);
      setSelectedResumeFile(null);
      setSelectedResumeName(null);
      setMessage("Resume uploaded and saved successfully");
    } catch (err) {
      console.error(err);
      setMessage("Unexpected error during upload");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveResumeUrl(publicUrl: string) {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient() as any;
      if (resumeId) {
        const payload: Database["public"]["Tables"]["resume"]["Update"] = { id: resumeId, file_url: publicUrl };
        const { error: upsertError } = await (supabase.from("resume") as any).upsert(payload);
        if (upsertError) {
          console.error("Failed to upsert resume:", upsertError);
          setMessage("Failed to save resume record");
          return;
        }
      } else {
        const { data: insertData, error: insertError } = await (supabase.from("resume") as any).insert({
          file_url: publicUrl,
        } as Database["public"]["Tables"]["resume"]["Insert"]);
        if (insertError) {
          console.error("Failed to insert resume:", insertError);
          setMessage("Failed to save resume record");
          return;
        }
        const created = insertData?.[0];
        const id = created?.id ?? null;
        if (id) setResumeId(id);
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to save resume URL");
    } finally {
      setLoading(false);
    }
  }

  // Projects helpers
  function resetProjectForm(nextMessage: string | null = null) {
    uploadAbortRef.current?.abort();
    uploadAbortRef.current = null;
    setProjectForm({ title: "", category: "", tags: "", is_featured: false, videoFile: null, videoUrl: "", videoSource: "upload" });
    setEditingProjectId(null);
    setVideoValidationError(null);
    setUploadProgress(0);
    setIsUploadingVideo(false);
    setMessage(nextMessage);
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function handleProjectInputChange<K extends keyof ProjectFormState>(field: K, value: ProjectFormState[K]) {
    setProjectForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "videoSource") {
        if (value === "external") {
          next.videoFile = null;
          if (!next.videoUrl) {
            next.videoUrl = prev.videoUrl;
          }
        }

        if (value === "upload") {
          next.videoUrl = "";
        }
      }

      return next;
    });
  }

  function handleProjectFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isUploadingVideo) {
      e.target.value = "";
      return;
    }

    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setProjectForm((prev) => ({ ...prev, videoFile: null, videoUrl: "", videoSource: "upload" }));
      setVideoValidationError(null);
      setMessage(null);
      return;
    }

    if (!file.type.startsWith("video/")) {
      setProjectForm((prev) => ({ ...prev, videoFile: null, videoUrl: "", videoSource: "upload" }));
      setVideoValidationError("Please select a valid video file.");
      setMessage("Please select a valid video file.");
      e.target.value = "";
      return;
    }

    setProjectForm((prev) => ({ ...prev, videoFile: file, videoUrl: "", videoSource: "upload" }));
    setVideoValidationError(null);
    setMessage(null);
  }

  function handleExternalUrlChange(value: string) {
    const trimmed = value.trim();
    const validUrl = validateExternalVideoUrl(trimmed);

    setProjectForm((prev) => ({ ...prev, videoUrl: value, videoSource: "external", videoFile: null }));

    if (!trimmed) {
      setVideoValidationError("Please enter a valid YouTube, Vimeo, or Cloudinary video URL.");
      return;
    }

    if (!validUrl) {
      setVideoValidationError("Unsupported video URL. Use YouTube, Vimeo, or Cloudinary.");
      return;
    }

    setVideoValidationError(null);
  }

  function cancelVideoUpload() {
    uploadAbortRef.current?.abort();
    uploadAbortRef.current = null;
    setIsUploadingVideo(false);
    setMessage("Video upload cancelled.");
  }

  async function handleSaveProject() {
    if (isUploadingVideo || loading) {
      return;
    }

    const normalizedExternalUrl = projectForm.videoSource === "external" ? validateExternalVideoUrl(projectForm.videoUrl) : null;
    if (projectForm.videoSource === "external" && !normalizedExternalUrl) {
      setVideoValidationError("Please provide a valid YouTube, Vimeo, or Cloudinary video URL.");
      setMessage("Please provide a valid YouTube, Vimeo, or Cloudinary video URL.");
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient() as any;

      const tagsArray = (projectForm.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload = {
        title: projectForm.title,
        category: projectForm.category as Database["public"]["Tables"]["projects"]["Insert"]["category"],
        tags: tagsArray.length ? tagsArray : undefined,
        is_featured: !!projectForm.is_featured,
      } as Database["public"]["Tables"]["projects"]["Insert"];

      if (projectForm.videoFile) {
        const controller = new AbortController();
        uploadAbortRef.current = controller;
        setIsUploadingVideo(true);
        setUploadProgress(0);
        setMessage("Uploading video: 0%");

        try {
          const secureUrl = await uploadToCloudinary(
            projectForm.videoFile,
            "projects",
            cloudName ?? undefined,
            (progress) => {
              setUploadProgress(progress);
              setMessage(`Uploading video: ${Math.round(progress)}%`);
            },
            controller.signal,
          );
          payload.video_url = secureUrl;
          setUploadProgress(100);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to upload project video";
          console.error("Cloudinary upload failed:", err);
          setMessage(errorMessage);
          setLoading(false);
          setIsUploadingVideo(false);
          uploadAbortRef.current = null;
          return;
        } finally {
          setIsUploadingVideo(false);
          uploadAbortRef.current = null;
        }
      } else if (projectForm.videoSource === "external" && normalizedExternalUrl) {
        payload.video_url = normalizedExternalUrl;
      } else if (editorProjectVideoUrl) {
        payload.video_url = editorProjectVideoUrl;
      }

      if (!payload.video_url) {
        setMessage("Please provide a video upload or a valid external video URL.");
        setLoading(false);
        return;
      }

      if (editingProjectId) {
        const { error: updateError } = await (supabase.from("projects") as any)
          .update(payload)
          .eq("id", editingProjectId);

        if (updateError) {
          console.error("Failed to update project:", updateError);
          setMessage("Failed to update project");
          setLoading(false);
          return;
        }

        const { data: projData, error: projError } = await (supabase.from("projects") as any).select("*").order("display_order", { ascending: true });
        if (projError) {
          console.error("Failed to reload projects:", projError);
        } else {
          setProjects((projData ?? []) as ProjectRow[]);
        }
        setUploadProgress(0);
        resetProjectForm("Project updated");
      } else {
        const { error: insertError } = await (supabase.from("projects") as any).insert(payload);
        if (insertError) {
          console.error("Failed to insert project:", insertError);
          setMessage("Failed to create project");
          setLoading(false);
          return;
        }

        const { data: projData, error: projError } = await (supabase.from("projects") as any).select("*").order("display_order", { ascending: true });
        if (projError) {
          console.error("Failed to reload projects:", projError);
        } else {
          setProjects((projData ?? []) as ProjectRow[]);
        }
        setUploadProgress(0);
        resetProjectForm("Project created");
      }
    } catch (err) {
      console.error(err);
      setMessage("Unexpected error saving project");
    } finally {
      setLoading(false);
      setIsUploadingVideo(false);
      uploadAbortRef.current = null;
    }
  }

  const editorProjectVideoUrl = editingProjectId ? projects.find((project) => project.id === editingProjectId)?.video_url ?? "" : "";

  function handleEditProject(p: ProjectRow) {
    const nextVideoSource = validateExternalVideoUrl(p.video_url ?? "") ? "external" : "upload";
    setEditingProjectId(p.id ?? null);
    setProjectForm({
      title: p.title ?? "",
      category: p.category ?? "",
      tags: (p.tags ?? []).join(", "),
      is_featured: !!p.is_featured,
      videoFile: null,
      videoUrl: p.video_url ?? "",
      videoSource: nextVideoSource,
    });
    setVideoValidationError(null);
  }

  async function handleDeleteProject(id: string) {
    if (!confirm("Delete this project?")) return;
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient() as any;
      const { error: deleteError } = await (supabase.from("projects") as any).delete().eq("id", id);
      if (deleteError) {
        console.error("Failed to delete project:", deleteError);
        setMessage("Failed to delete project");
        setLoading(false);
        return;
      }
      const { data: projData, error: projError } = await supabase.from("projects").select("*").order("display_order", { ascending: true });
      if (projError) {
        console.error("Failed to reload projects:", projError);
      } else {
        setProjects((projData ?? []) as ProjectRow[]);
      }
      setMessage("Project deleted");
    } catch (err) {
      console.error(err);
      setMessage("Unexpected error deleting project");
    } finally {
      setLoading(false);
    }
  }

  async function loadTools() {
    const supabase = createClient() as any;
    const { data, error } = await (supabase.from("tools") as any).select("*").order("display_order", { ascending: true });
    if (error) {
      console.error("Failed to load tools:", error);
      setToolMessage("Failed to load tools");
      return;
    }
    setTools((data ?? []) as ToolRow[]);
  }

  function resetToolForm() {
    setEditingToolId(null);
    setToolForm({ name: "", icon_url: "", display_order: Math.max(1, tools.length + 1) });
    setToolMessage(null);
  }

  async function handleSaveTool() {
    const trimmedName = toolForm.name.trim();
    if (!trimmedName) {
      setToolMessage("Tool name is required.");
      return;
    }

    setToolSaving(true);
    setToolMessage(null);
    try {
      const supabase = createClient() as any;
      const payload = {
        name: trimmedName,
        icon_url: toolForm.icon_url.trim() || null,
        display_order: toolForm.display_order || tools.length + 1,
      } as Database["public"]["Tables"]["tools"]["Insert"];

      if (editingToolId) {
        const { error } = await (supabase.from("tools") as any).update(payload).eq("id", editingToolId);
        if (error) {
          console.error("Failed to update tool:", error);
          setToolMessage("Failed to update tool.");
          return;
        }
        setToolMessage("Tool updated.");
      } else {
        const { error } = await (supabase.from("tools") as any).insert(payload);
        if (error) {
          console.error("Failed to insert tool:", error);
          setToolMessage("Failed to create tool.");
          return;
        }
        setToolMessage("Tool created.");
      }

      await loadTools();
      resetToolForm();
    } catch (err) {
      console.error("Unexpected tool save error:", err);
      setToolMessage("Unexpected tool save error.");
    } finally {
      setToolSaving(false);
    }
  }

  async function handleDeleteTool(id: string) {
    if (!confirm("Delete this tool?")) {
      return;
    }

    setToolSaving(true);
    setToolMessage(null);
    try {
      const supabase = createClient() as any;
      const { error } = await (supabase.from("tools") as any).delete().eq("id", id);
      if (error) {
        console.error("Failed to delete tool:", error);
        setToolMessage("Failed to delete tool.");
        return;
      }
      setToolMessage("Tool deleted.");
      await loadTools();
      if (editingToolId === id) {
        resetToolForm();
      }
    } catch (err) {
      console.error("Unexpected tool delete error:", err);
      setToolMessage("Unexpected tool delete error.");
    } finally {
      setToolSaving(false);
    }
  }

  function handleEditTool(tool: ToolRow) {
    setEditingToolId(tool.id);
    setToolForm({
      name: tool.name ?? "",
      icon_url: tool.icon_url ?? "",
      display_order: Number(tool.display_order ?? 1),
    });
    setToolMessage(null);
  }

  const adminSections = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "portfolio", label: "Portfolio" },
    { id: "tools", label: "Tools" },
    { id: "resume", label: "Resume" },
    { id: "contact", label: "Contact" },
  ] as const;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">Content Management</h1>
        <p className="mt-2 text-sm text-white/65">Manage site content, portfolio projects, tools, and resume updates.</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 p-2">
        {adminSections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={
              activeSection === section.id
                ? "rounded-full border border-white/30 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black"
                : "rounded-full border border-white/10 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 transition hover:bg-white hover:text-black"
            }
          >
            {section.label}
          </button>
        ))}
      </div>

      {activeSection === "resume" ? (
        <section className="rounded-2xl border border-white/10 bg-black/60 p-6 shadow-[0_0_30px_rgba(255,255,255,0.04)]">
          <h2 className="mb-2 text-xl font-semibold text-white">Resume Management</h2>
          <p className="mb-4 text-sm text-white/60">Upload a single PDF resume. Existing resume is preserved until a new file is uploaded and saved.</p>

          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Current resume</p>
            {fileUrl ? (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <a href={fileUrl} target="_blank" rel="noreferrer" className="text-sm text-white underline break-all">View current resume</a>
                <span className="text-sm text-white/50">•</span>
                <span className="text-sm text-white/50">URL saved</span>
              </div>
            ) : (
              <div className="mt-2 text-sm text-white/50">No resume uploaded</div>
            )}
          </div>

          <div className="space-y-3">
            <label className="sr-only" htmlFor="resume-file">Choose resume PDF</label>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <input id="resume-file" type="file" accept="application/pdf" onChange={handleResumeFileChange} className="hidden" />
              <label htmlFor="resume-file" className="inline-flex w-fit cursor-pointer rounded-full border border-white/30 px-4 py-2 text-sm text-white transition hover:bg-white hover:text-black">Choose PDF…</label>
              <div className="text-sm text-white/60">{selectedResumeName ?? "No file chosen"}</div>
              <button
                type="button"
                onClick={() => { void uploadSelectedResume(); }}
                disabled={loading}
                className="ml-auto rounded-full border border-white/70 bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-[#2a2a2a] disabled:text-white/40"
              >
                {loading ? "Uploading…" : "Upload Resume"}
              </button>
            </div>
            <div className="text-xs text-white/50">Only PDF. Max file size is governed by your Supabase storage rules.</div>
          </div>
        </section>
      ) : null}

      {activeSection === "portfolio" ? (
        <div className="grid gap-8 xl:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-black/60 p-6 shadow-[0_0_30px_rgba(255,255,255,0.04)]">
            <h2 className="mb-2 text-xl font-semibold text-white">Project Management</h2>
            <p className="mb-4 text-sm text-white/60">Create, edit, or delete portfolio projects. Tags are saved as an array and categories must match the portfolio category set.</p>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-white/70">Title</label>
                <input aria-label="Project title" placeholder="Project title" value={projectForm.title} onChange={(e) => handleProjectInputChange("title", e.target.value)} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20" />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-white/70">Category</label>
                  <select value={projectForm.category} onChange={(e) => handleProjectInputChange("category", e.target.value)} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20">
                    <option value="" disabled className="text-white/60">Choose category</option>
                    <option value="ai_ugc" className="text-black bg-white">AI + UGC</option>
                    <option value="broll_vo" className="text-black bg-white">B-Roll + VO</option>
                    <option value="ai_creatives" className="text-black bg-white">AI Creatives</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-white/70">Tags (comma separated)</label>
                  <input placeholder="eg. UGC, AI Video, Motion" value={projectForm.tags} onChange={(e) => handleProjectInputChange("tags", e.target.value)} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-white/80">
                <input aria-label="Featured" type="checkbox" checked={projectForm.is_featured} onChange={(e) => handleProjectInputChange("is_featured", e.target.checked)} className="h-4 w-4 text-white" />
                Featured project
              </label>

              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <label className="mb-2 block text-sm text-white/75">Video source</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="inline-flex items-center gap-2 text-sm text-white/80">
                    <input type="radio" name="video-source" checked={projectForm.videoSource === "upload"} onChange={() => handleProjectInputChange("videoSource", "upload")} className="h-4 w-4" />
                    Upload to Cloudinary
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-white/80">
                    <input type="radio" name="video-source" checked={projectForm.videoSource === "external"} onChange={() => handleProjectInputChange("videoSource", "external")} className="h-4 w-4" />
                    External video URL
                  </label>
                </div>
              </div>

              {projectForm.videoSource === "upload" ? (
                <div>
                  <label className="mb-1 block text-sm text-white/70">Video file</label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input id="project-video" type="file" accept="video/*" onChange={handleProjectFileChange} disabled={isUploadingVideo || loading} className="hidden" />
                    <label htmlFor={isUploadingVideo ? undefined : "project-video"} className={isUploadingVideo ? "inline-block rounded-full border border-white/20 bg-[#1a1a1a] px-4 py-2 text-sm text-white/50" : "inline-block rounded-full border border-white/30 px-4 py-2 text-sm text-white hover:bg-white hover:text-black"} aria-disabled={isUploadingVideo}>{isUploadingVideo ? "Uploading…" : "Choose video…"}</label>
                    <div className="text-sm text-white/60">
                      {projectForm.videoFile ? `${projectForm.videoFile.name} (${formatFileSize(projectForm.videoFile.size)})` : editingProjectId && projectForm.videoUrl ? "Using current video" : "No file chosen"}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-sm text-white/70">External video URL</label>
                  <input
                    type="url"
                    value={projectForm.videoUrl}
                    onChange={(e) => handleExternalUrlChange(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                    disabled={loading || isUploadingVideo}
                  />
                  <div className="mt-2 text-xs text-white/50">Allowed: YouTube, Vimeo, or Cloudinary direct video URLs.</div>
                </div>
              )}

              {videoValidationError ? <div className="text-sm text-red-300">{videoValidationError}</div> : null}
              {isUploadingVideo ? <div className="text-sm text-white/70">Uploading video: {Math.round(uploadProgress)}%</div> : null}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { void handleSaveProject(); }}
                  disabled={Boolean(videoValidationError) || loading || isUploadingVideo || !projectForm.title || !projectForm.category || (!projectForm.videoFile && projectForm.videoSource === "upload") || (projectForm.videoSource === "external" && !validateExternalVideoUrl(projectForm.videoUrl))}
                  className="rounded-full border border-white/70 bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-[#2a2a2a] disabled:text-white/40"
                >
                  {loading ? (editingProjectId ? "Saving…" : "Creating…") : (editingProjectId ? "Save changes" : "Create project")}
                </button>
                <button type="button" onClick={() => resetProjectForm()} disabled={isUploadingVideo || loading} className="rounded-full border border-white/10 px-4 py-2 text-white bg-transparent hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-[#2a2a2a] disabled:text-white/40">Clear</button>
                {isUploadingVideo ? (
                  <button type="button" onClick={cancelVideoUpload} className="rounded-full border border-red-400/60 px-4 py-2 text-sm text-red-200 bg-transparent hover:bg-red-500/10">Cancel</button>
                ) : null}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-sm uppercase tracking-[0.2em] text-white/60">Existing projects</h3>
              <div className="space-y-3">
                {projects.length === 0 ? (
                  <div className="rounded-md border border-dashed border-white/10 p-4 text-white/50">No projects yet. Create your first project above.</div>
                ) : (
                  projects.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-3">
                      <div className="h-16 w-28 overflow-hidden rounded bg-black/40">
                        {p.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.thumbnail_url} alt={p.title} className="h-full w-full object-cover" />
                        ) : p.video_url ? (
                          <video src={p.video_url} className="h-full w-full object-cover" muted playsInline />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-white/50">No media</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white">{p.title}</div>
                        <div className="text-sm text-white/60">{p.category} {p.is_featured ? "• Featured" : ""}</div>
                        <div className="mt-1 text-xs text-white/50">{(p.tags ?? []).join(", ") || "No tags"}</div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button type="button" onClick={() => handleEditProject(p)} className="rounded-full border border-white/10 px-3 py-1 text-white bg-transparent hover:bg-white hover:text-black">Edit</button>
                        <button type="button" onClick={() => handleDeleteProject(p.id)} className="rounded-full border border-white/10 px-3 py-1 text-white bg-transparent hover:bg-white hover:text-black">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {activeSection === "tools" ? (
        <section className="rounded-2xl border border-white/10 bg-black/60 p-6 shadow-[0_0_30px_rgba(255,255,255,0.04)]">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Tools Manager</h2>
              <p className="text-sm text-white/60">Manage the tools displayed on the Home page. The current schema supports `name`, `icon_url`, and `display_order`.</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <div>
                <label className="mb-1 block text-sm text-white/70">Tool name</label>
                <input
                  value={toolForm.name}
                  onChange={(e) => setToolForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Premiere Pro"
                  className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-white/70">Icon URL or local asset</label>
                <input
                  value={toolForm.icon_url}
                  onChange={(e) => setToolForm((prev) => ({ ...prev, icon_url: e.target.value }))}
                  placeholder="/icons/adobepremierepro.svg or https://..."
                  className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>

          <div className="rounded-md border border-white/10 bg-black/20 p-3">
            <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/60">Live preview</div>
            <div className="flex min-h-12 items-center gap-3">
              {toolForm.icon_url ? (
                /^\/?(?:.*\/)?[^\s]+\.(svg|png|jpg|jpeg|webp)$/i.test(toolForm.icon_url) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={toolForm.icon_url}
                    alt={toolForm.name || "Tool icon preview"}
                    className="h-8 w-8 shrink-0 object-contain grayscale brightness-0 invert"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-black text-white">
                    {(toolForm.name || "T").slice(0, 1).toUpperCase()}
                  </div>
                )
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-black text-white">
                  {(toolForm.name || "T").slice(0, 1).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-white/75">{toolForm.name || "Tool name"}</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-white/70">Display order</label>
            <input
              type="number"
              min={1}
              value={toolForm.display_order}
              onChange={(e) => setToolForm((prev) => ({ ...prev, display_order: Number(e.target.value || 1) }))}
              className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {toolMessage ? <div className="text-sm text-white/70">{toolMessage}</div> : null}

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => { void handleSaveTool(); }} disabled={toolSaving} className="rounded-full border border-white/70 bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-[#2a2a2a] disabled:text-white/40">
              {toolSaving ? "Saving…" : editingToolId ? "Update tool" : "Add tool"}
            </button>
            <button type="button" onClick={resetToolForm} className="rounded-full border border-white/10 px-4 py-2 text-white bg-transparent hover:bg-white hover:text-black">Clear</button>
          </div>
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm uppercase tracking-[0.2em] text-white/60">Current tools</h3>
          {tools.length === 0 ? (
            <div className="rounded-md border border-dashed border-white/10 p-4 text-white/50">No tools added yet.</div>
          ) : (
            <div className="space-y-3">
              {tools.map((tool) => (
                <div key={tool.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/30 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {tool.icon_url ? (
                      /^\/?(?:.*\/)?[^\s]+\.(svg|png|jpg|jpeg|webp)$/i.test(tool.icon_url) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={tool.icon_url} alt={tool.name} className="h-8 w-8 shrink-0 object-contain grayscale brightness-0 invert" />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-black text-white">
                          {(tool.name ?? "T").slice(0, 1).toUpperCase()}
                        </div>
                      )
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-black text-white">
                        {(tool.name ?? "T").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="truncate font-medium text-white">{tool.name}</div>
                      {tool.icon_url ? <div className="truncate text-xs text-white/50">{tool.icon_url}</div> : null}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleEditTool(tool)} className="rounded-full border border-white/10 px-3 py-1 text-white bg-transparent hover:bg-white hover:text-black">Edit</button>
                    <button type="button" onClick={() => { void handleDeleteTool(tool.id); }} className="rounded-full border border-white/10 px-3 py-1 text-white bg-transparent hover:bg-white hover:text-black">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>
          </div>
        </section>
      ) : null}

      {activeSection === "home" ? (
        <section className="text-white">
          <HomeContentEditor />
        </section>
      ) : null}

      {activeSection === "about" ? (
        <section className="text-white">
          <AboutContentEditor />
        </section>
      ) : null}

      {activeSection === "contact" ? (
        <section className="text-white">
          <ContactContentEditor />
        </section>
      ) : null}

      {message ? <div className="mt-8 text-sm text-white/80">{message}</div> : null}
    </main>
  );
}
