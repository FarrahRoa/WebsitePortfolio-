"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import type { Database } from "../backend/types/database.types";

type ContactRow = Database["public"]["Tables"]["contact_info"]["Row"];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ContactContentEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [sectionContent, setSectionContent] = useState({ eyebrow: "Contact", heading: "Let\'s Work Together", description: "" });
  const [contact, setContact] = useState<ContactRow | null>(null);
  const [form, setForm] = useState({ email: "", phone: "", linkedin_url: "" });

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      setLoading(true);
      try {
        const [siteRes, contactRes] = await Promise.all([
          supabase.from("site_content").select("section_key, content_json"),
          supabase.from("contact_info").select("*").limit(1).maybeSingle(),
        ]);
        const contentMap = new Map((siteRes.data ?? []).map((r: any) => [r.section_key, r.content_json]));
        const contactSection = (contentMap.get("contact") ?? {}) as any;
        setSectionContent({ eyebrow: contactSection.eyebrow ?? "Contact", heading: contactSection.heading ?? "Let\'s Work Together", description: contactSection.description ?? "" });

        if ((contactRes as any).data) {
          const d = (contactRes as any).data as ContactRow;
          setContact(d);
          setForm({ email: d.email ?? "", phone: d.phone ?? "", linkedin_url: d.linkedin_url ?? "" });
        }
      } catch (err) {
        console.error("Failed to load contact editor data", err);
        setMessage("Failed to load contact data");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function saveContactInfo() {
    setSaving(true);
    setMessage(null);
    const supabase = createClient() as any;
    try {
      const trimmedEmail = form.email.trim();
      const trimmedPhone = form.phone.trim();
      const trimmedLinkedin = form.linkedin_url.trim();

      if (!isValidEmail(trimmedEmail)) {
        setMessage("Enter a valid email address.");
        setSaving(false);
        return;
      }
      if (trimmedLinkedin && !isValidHttpUrl(trimmedLinkedin)) {
        setMessage("Enter a valid LinkedIn https:// URL or leave blank.");
        setSaving(false);
        return;
      }

      if (contact?.id) {
        const { error } = await supabase.from("contact_info").update({ email: trimmedEmail, phone: trimmedPhone, linkedin_url: trimmedLinkedin }).eq("id", contact.id);
        if (error) throw error;
        setMessage("Contact updated");
      } else {
        const { data, error } = await supabase.from("contact_info").insert({ email: trimmedEmail, phone: trimmedPhone, linkedin_url: trimmedLinkedin });
        if (error) throw error;
        if (data && data[0]) setContact(data[0]);
        setMessage("Contact created");
      }

      // upsert site_content contact section
      const { error: upsertErr } = await supabase.from("site_content").upsert({ section_key: "contact", content_json: sectionContent });
      if (upsertErr) {
        console.error("Failed to upsert contact site_content", upsertErr);
        setMessage((prev) => (prev ? prev + "; failed to save section content" : "Failed to save section content"));
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to save contact info");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
        <h3 className="text-lg font-semibold text-white">Contact section content</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-white/70">Section eyebrow</label>
            <input value={sectionContent.eyebrow} onChange={(e) => setSectionContent((s) => ({ ...s, eyebrow: e.target.value }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Main heading</label>
            <input value={sectionContent.heading} onChange={(e) => setSectionContent((s) => ({ ...s, heading: e.target.value }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-white/70">Supporting paragraph</label>
            <textarea value={sectionContent.description} onChange={(e) => setSectionContent((s) => ({ ...s, description: e.target.value }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white min-h-[80px]" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
        <h3 className="text-lg font-semibold text-white">Contact details</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-white/70">Email</label>
            <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Phone</label>
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-white/70">LinkedIn profile (https://)</label>
            <input value={form.linkedin_url} onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={saveContactInfo} disabled={saving} className="rounded-full border border-white/70 bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black">{saving ? "Saving…" : "Save contact"}</button>
        </div>
      </div>

      {message ? <div className="text-sm text-white/70">{message}</div> : null}
    </div>
  );
}
