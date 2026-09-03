"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import type { Database } from "../backend/types/database.types";
import HeroCampaignVisual from "./HeroCampaignVisual";

type SiteContent = Database["public"]["Tables"]["site_content"]["Row"];
type SkillRow = Database["public"]["Tables"]["skills"]["Row"];

export default function AboutContentEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [aboutIntro, setAboutIntro] = useState({ text: "", photo_url: "" } as any);
  const [differentiators, setDifferentiators] = useState<string[]>([]);

  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [skillForm, setSkillForm] = useState({ id: "", category: "video_editing", skill_name: "", display_order: 1 });
  const [skillSaving, setSkillSaving] = useState(false);

  // Profile photo upload state
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [selectedPhotoName, setSelectedPhotoName] = useState<string | null>(null);
  const [selectedPhotoSize, setSelectedPhotoSize] = useState<number | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUploadProgress, setPhotoUploadProgress] = useState(0);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      setLoading(true);
      try {
        const [contentRes, skillsRes] = await Promise.all([
          supabase.from("site_content").select("section_key, content_json"),
          supabase.from("skills").select("*").order("display_order", { ascending: true }),
        ]);

        const contentMap = new Map((contentRes.data ?? []).map((r: any) => [r.section_key, r.content_json]));
        const intro = (contentMap.get("about_intro") ?? {}) as any;
        const diffs = (contentMap.get("about_differentiators") ?? []) as string[];
        setAboutIntro({ text: intro.text ?? "", photo_url: intro.photo_url ?? "" });
        setDifferentiators(Array.isArray(diffs) ? diffs : []);

        setSkills((skillsRes.data ?? []) as SkillRow[]);
      } catch (err) {
        console.error("Failed to load about content", err);
        setMessage("Failed to load content");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function upsertSection(sectionKey: string, contentJson: any) {
    const supabase = createClient() as any;
    try {
      const payload = { section_key: sectionKey, content_json: contentJson } as Database["public"]["Tables"]["site_content"]["Insert"];
      const { error } = await supabase.from("site_content").upsert(payload);
      if (error) throw error;
      setMessage("Saved");
    } catch (err) {
      console.error("Failed to upsert site_content", err);
      setMessage("Failed to save section");
      throw err;
    }
  }

  async function handleSaveAll() {
    setSaving(true);
    setMessage(null);
    try {
      await upsertSection("about_intro", aboutIntro);
      await upsertSection("about_differentiators", differentiators);
      setMessage("About content saved");
    } catch (err) {
      // handled
    } finally {
      setSaving(false);
    }
  }

  // Profile photo file selection and upload
  function handlePhotoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoUploadError(null);
    if (!file) {
      setSelectedPhotoFile(null);
      setSelectedPhotoName(null);
      setSelectedPhotoSize(null);
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
        setPhotoPreviewUrl(null);
      }
      return;
    }

    const accept = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!accept.includes(file.type)) {
      setPhotoUploadError("Invalid file type. Accepts JPG, PNG, or WebP.");
      e.currentTarget.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoUploadError("Image is too large. Maximum 5 MB.");
      e.currentTarget.value = "";
      return;
    }

    setSelectedPhotoFile(file);
    setSelectedPhotoName(file.name);
    setSelectedPhotoSize(file.size);
    const preview = URL.createObjectURL(file);
    setPhotoPreviewUrl(preview);
  }

  async function uploadPhotoToCloudinary() {
    setPhotoUploadError(null);
    setPhotoUploadProgress(0);
    if (!selectedPhotoFile) {
      setPhotoUploadError("No file selected");
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_PRESET;
    if (!cloudName || !preset) {
      setPhotoUploadError("Cloudinary not configured");
      return;
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    setUploadingPhoto(true);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const resp = JSON.parse(xhr.responseText);
              const secureUrl = resp.secure_url ?? resp.url ?? null;
              if (!secureUrl) {
                setPhotoUploadError("Upload succeeded but secure URL missing from Cloudinary response");
                reject(new Error("Missing secure_url"));
                return;
              }
              // update state and save to DB
              setAboutIntro((prev: any) => ({ ...prev, photo_url: secureUrl }));
              // persist the about_intro section
              const supabase = createClient() as any;
              void (async () => {
                const { error } = await supabase.from("site_content").upsert({ section_key: "about_intro", content_json: { ...aboutIntro, photo_url: secureUrl } });
                if (error) {
                  console.error("Failed to save uploaded photo URL to site_content", error);
                  setPhotoUploadError("Uploaded but failed to save URL to database.");
                } else {
                  setMessage("Photo uploaded and saved.");
                }
              })();

              resolve();
            } catch (err) {
              console.error(err);
              setPhotoUploadError("Failed to parse Cloudinary response");
              reject(err);
            }
          } else {
            setPhotoUploadError(`Upload failed: ${xhr.status} ${xhr.statusText}`);
            reject(new Error(`Status ${xhr.status}`));
          }
        };
        xhr.onerror = () => {
          setPhotoUploadError("Network error during upload");
          reject(new Error("Network error"));
        };
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = (event.loaded / event.total) * 100;
            setPhotoUploadProgress(percent);
          }
        };

        const fd = new FormData();
        fd.append("file", selectedPhotoFile, selectedPhotoFile.name);
        fd.append("upload_preset", preset);

        // do not set Content-Type header
        xhr.send(fd);
      });
    } catch (err) {
      console.error("Upload error", err);
    } finally {
      setUploadingPhoto(false);
      setPhotoUploadProgress(0);
      // do not clear selection so user can retry if needed
    }
  }

  // Skills CRUD
  async function handleEditSkill(s: SkillRow) {
    setSkillForm({ id: s.id, category: s.category, skill_name: s.skill_name, display_order: Number(s.display_order ?? 1) });
  }

  async function handleSaveSkill() {
    const supabase = createClient() as any;
    const name = skillForm.skill_name.trim();
    if (!name) {
      setMessage("Skill name required");
      return;
    }
    setSkillSaving(true);
    try {
      if (skillForm.id) {
        const { error } = await supabase.from("skills").update({ category: skillForm.category, skill_name: name, display_order: skillForm.display_order }).eq("id", skillForm.id);
        if (error) throw error;
        setMessage("Skill updated");
      } else {
        const { error } = await supabase.from("skills").insert({ category: skillForm.category as any, skill_name: name, display_order: skillForm.display_order });
        if (error) throw error;
        setMessage("Skill created");
      }
      const { data } = await supabase.from("skills").select("*").order("display_order", { ascending: true });
      setSkills(data ?? []);
      setSkillForm({ id: "", category: "video_editing", skill_name: "", display_order: (data?.length ?? 0) + 1 });
    } catch (err) {
      console.error(err);
      setMessage("Failed to save skill");
    } finally {
      setSkillSaving(false);
    }
  }

  async function handleDeleteSkill(id: string) {
    if (!confirm("Delete skill?")) return;
    const supabase = createClient() as any;
    try {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw error;
      const { data } = await supabase.from("skills").select("*").order("display_order", { ascending: true });
      setSkills(data ?? []);
      setMessage("Skill deleted");
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete skill");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
        <h3 className="text-lg font-semibold text-white">About introduction</h3>
        <div className="mt-3">
          <label className="mb-1 block text-sm text-white/70">Intro text</label>
          <textarea value={aboutIntro.text} onChange={(e) => setAboutIntro((s: any) => ({ ...s, text: e.target.value }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white min-h-[120px]" />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-white/70">Profile photo URL</label>
            <input value={aboutIntro.photo_url} onChange={(e) => setAboutIntro((s: any) => ({ ...s, photo_url: e.target.value }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />

            <div className="mt-3 flex flex-col gap-2">
              <label htmlFor="profile-photo" className="inline-flex items-center gap-3">
                <input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoFileChange} className="hidden" />
                <button type="button" onClick={() => document.getElementById('profile-photo')?.click()} className="rounded-full border border-white/10 px-4 py-2 text-white bg-transparent hover:bg-white hover:text-black">Choose photo…</button>
                <button type="button" onClick={() => { setSelectedPhotoFile(null); setSelectedPhotoName(null); setSelectedPhotoSize(null); if (photoPreviewUrl) { URL.revokeObjectURL(photoPreviewUrl); setPhotoPreviewUrl(null); } }} className="rounded-full border border-white/10 px-3 py-2 text-white bg-transparent hover:bg-white hover:text-black">Clear</button>
              </label>

              <div className="text-sm text-white/60">{selectedPhotoName ?? "No file chosen"}{selectedPhotoSize ? ` — ${(selectedPhotoSize / 1024 / 1024).toFixed(2)} MB` : ""}</div>

              {photoPreviewUrl ? (
                <div className="mt-2 w-36 overflow-hidden rounded-full border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreviewUrl} alt="Preview" className="h-36 w-36 object-cover grayscale" />
                </div>
              ) : null}

              {/* Hero mock preview */}
              {photoPreviewUrl ? (
                <div className="mt-3">
                  <div className="text-xs text-white/60">Hero mock preview</div>
                  <div className="mt-2">
                    <HeroCampaignVisual profilePhotoUrl={photoPreviewUrl} className="w-72 md:w-80 lg:w-96" />
                  </div>
                </div>
              ) : null}

              <div className="flex items-center gap-3">
                <button onClick={uploadPhotoToCloudinary} disabled={uploadingPhoto || !selectedPhotoFile} className="rounded-full border border-white/70 bg-transparent px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-[#2a2a2a] disabled:text-white/40">{uploadingPhoto ? `Uploading… ${Math.round(photoUploadProgress)}%` : "Upload photo"}</button>
                {photoUploadError ? <div className="text-sm text-red-300">{photoUploadError}</div> : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
        <h3 className="text-lg font-semibold text-white">Differentiators</h3>
        <p className="mt-2 text-sm text-white/60">Short bullet points shown on the About page.</p>
        <div className="mt-3 space-y-2">
          {differentiators.map((d, i) => (
            <div key={i} className="flex gap-3">
              <input value={d} onChange={(e) => setDifferentiators((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))} className="flex-1 rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
              <button onClick={() => setDifferentiators((prev) => prev.filter((_, idx) => idx !== i))} className="rounded-full border border-white/10 px-3 py-1 text-white bg-transparent hover:bg-white hover:text-black">Remove</button>
            </div>
          ))}
          <div>
            <button onClick={() => setDifferentiators((prev) => [...prev, ""]) } className="rounded-full border border-white/10 px-4 py-2 text-white bg-transparent hover:bg-white hover:text-black">Add</button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
        <h3 className="text-lg font-semibold text-white">Skills</h3>
        <p className="mt-2 text-sm text-white/60">Manage skills shown on the About page.</p>

        <div className="mt-4 grid gap-3">
          {skills.map((s) => (
            <div key={s.id} className="rounded-md border border-white/10 bg-white/5 p-3 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium text-white truncate">{s.skill_name}</div>
                <div className="text-xs text-white/60">{s.category}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditSkill(s)} className="rounded-full border border-white/10 px-3 py-1 text-white bg-transparent hover:bg-white hover:text-black">Edit</button>
                <button onClick={() => handleDeleteSkill(s.id)} className="rounded-full border border-white/10 px-3 py-1 text-white bg-transparent hover:bg-white hover:text-black">Delete</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-white/10 bg-white/5 p-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-white/70">Skill name</label>
            <input value={skillForm.skill_name} onChange={(e) => setSkillForm((s) => ({ ...s, skill_name: e.target.value }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Category</label>
            <select value={skillForm.category} onChange={(e) => setSkillForm((s) => ({ ...s, category: e.target.value }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white">
              <option value="video_editing" className="text-black bg-white">Video editing</option>
              <option value="ai_creative" className="text-black bg-white">AI & creative</option>
              <option value="software_tools" className="text-black bg-white">Software & tools</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Display order</label>
            <input type="number" min={1} value={skillForm.display_order} onChange={(e) => setSkillForm((s) => ({ ...s, display_order: Number(e.target.value || 1) }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
          </div>
          <div className="flex items-end">
            <div className="flex gap-3">
              <button onClick={() => handleSaveSkill()} disabled={skillSaving} className="rounded-full border border-white/70 bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black">{skillSaving ? "Saving…" : skillForm.id ? "Update" : "Add skill"}</button>
              <button onClick={() => setSkillForm({ id: "", category: "video_editing", skill_name: "", display_order: (skills.length ?? 0) + 1 })} className="rounded-full border border-white/10 px-4 py-2 text-white bg-transparent hover:bg-white hover:text-black">Clear</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSaveAll} disabled={saving} className="rounded-full border border-white/70 bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black">{saving ? "Saving…" : "Save About content"}</button>
      </div>

      {message ? <div className="text-sm text-white/70">{message}</div> : null}
    </div>
  );
}
