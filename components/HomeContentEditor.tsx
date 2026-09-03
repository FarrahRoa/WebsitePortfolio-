"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import type { Database } from "../backend/types/database.types";

type SiteContent = Database["public"]["Tables"]["site_content"]["Row"];
type ServiceRow = Database["public"]["Tables"]["services"]["Row"];

export default function HomeContentEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [hero, setHero] = useState({ title: "", subtitle: "", description: "", cta_primary: { label: "", url: "" }, cta_secondary: { label: "", url: "" } } as any);
  const [intro, setIntro] = useState({ text: "" } as any);
  const [toolsCta, setToolsCta] = useState({ text: "" } as any);

  const [services, setServices] = useState<ServiceRow[]>([]);
  const [serviceForm, setServiceForm] = useState({ id: "", title: "", description: "", display_order: 1 });
  const [serviceSaving, setServiceSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      setLoading(true);
      try {
        const [contentRes, servicesRes] = await Promise.all([
          supabase.from("site_content").select("section_key, content_json"),
          supabase.from("services").select("*").order("display_order", { ascending: true }),
        ]);

        const contentMap = new Map((contentRes.data ?? []).map((r: any) => [r.section_key, r.content_json]));
        const h = (contentMap.get("hero") ?? {}) as any;
        const i = (contentMap.get("intro") ?? {}) as any;
        const t = (contentMap.get("tools_cta") ?? {}) as any;
        setHero({ title: h.title ?? "", subtitle: h.subtitle ?? "", description: h.description ?? "", cta_primary: h.cta_primary ?? { label: "", url: "" }, cta_secondary: h.cta_secondary ?? { label: "", url: "" } });
        setIntro({ text: i.text ?? "" });
        setToolsCta({ text: t.text ?? "" });

        setServices((servicesRes.data ?? []) as ServiceRow[]);
      } catch (err) {
        console.error("Failed to load home content", err);
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
      await upsertSection("hero", hero);
      await upsertSection("intro", intro);
      await upsertSection("tools_cta", toolsCta);
      setMessage("Home content saved");
    } catch (err) {
      // message already set
    } finally {
      setSaving(false);
    }
  }

  // Services CRUD
  async function handleEditService(s: ServiceRow) {
    setServiceForm({ id: s.id, title: s.title, description: s.description, display_order: Number(s.display_order ?? 1) });
  }

  async function handleSaveService() {
    const supabase = createClient() as any;
    const title = serviceForm.title.trim();
    const description = serviceForm.description.trim();
    if (!title || !description) {
      setMessage("Service title and description required");
      return;
    }
    setServiceSaving(true);
    try {
      if (serviceForm.id) {
        const { error } = await supabase.from("services").update({ title, description, display_order: serviceForm.display_order }).eq("id", serviceForm.id);
        if (error) throw error;
        setMessage("Service updated");
      } else {
        const { error } = await supabase.from("services").insert({ title, description, display_order: serviceForm.display_order });
        if (error) throw error;
        setMessage("Service created");
      }
      const { data } = await supabase.from("services").select("*").order("display_order", { ascending: true });
      setServices(data ?? []);
      setServiceForm({ id: "", title: "", description: "", display_order: (data?.length ?? 0) + 1 });
    } catch (err) {
      console.error(err);
      setMessage("Failed to save service");
    } finally {
      setServiceSaving(false);
    }
  }

  async function handleDeleteService(id: string) {
    if (!confirm("Delete this service?")) return;
    const supabase = createClient() as any;
    try {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
      const { data } = await supabase.from("services").select("*").order("display_order", { ascending: true });
      setServices(data ?? []);
      setMessage("Service deleted");
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete service");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
        <h3 className="text-lg font-semibold text-white">Hero</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-white/70">Eyebrow / Subtitle</label>
            <input value={hero.subtitle} onChange={(e) => setHero((s: any) => ({ ...s, subtitle: e.target.value }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Title</label>
            <input value={hero.title} onChange={(e) => setHero((s: any) => ({ ...s, title: e.target.value }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-white/70">Description</label>
            <textarea value={hero.description} onChange={(e) => setHero((s: any) => ({ ...s, description: e.target.value }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white min-h-[80px]" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Primary CTA label</label>
            <input value={hero.cta_primary.label} onChange={(e) => setHero((s: any) => ({ ...s, cta_primary: { ...s.cta_primary, label: e.target.value } }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Primary CTA URL</label>
            <input value={hero.cta_primary.url} onChange={(e) => setHero((s: any) => ({ ...s, cta_primary: { ...s.cta_primary, url: e.target.value } }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Secondary CTA label</label>
            <input value={hero.cta_secondary.label} onChange={(e) => setHero((s: any) => ({ ...s, cta_secondary: { ...s.cta_secondary, label: e.target.value } }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/70">Secondary CTA URL</label>
            <input value={hero.cta_secondary.url} onChange={(e) => setHero((s: any) => ({ ...s, cta_secondary: { ...s.cta_secondary, url: e.target.value } }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
        <h3 className="text-lg font-semibold text-white">Quick intro</h3>
        <div className="mt-3">
          <label className="mb-1 block text-sm text-white/70">Intro text</label>
          <textarea value={intro.text} onChange={(e) => setIntro({ text: e.target.value })} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white min-h-[80px]" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
        <h3 className="text-lg font-semibold text-white">Tools CTA</h3>
        <div className="mt-3">
          <label className="mb-1 block text-sm text-white/70">CTA text</label>
          <input value={toolsCta.text} onChange={(e) => setToolsCta({ text: e.target.value })} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Creative support / Services</h3>
        </div>
        <p className="mt-2 text-sm text-white/60">Manage the service cards shown on the Home page.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {services.map((s) => (
            <div key={s.id} className="rounded-md border border-white/10 bg-white/5 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate">{s.title}</div>
                  <div className="mt-1 text-sm text-white/60 truncate">{s.description}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleEditService(s)} className="rounded-full border border-white/10 px-3 py-1 text-white bg-transparent hover:bg-white hover:text-black">Edit</button>
                  <button onClick={() => handleDeleteService(s.id)} className="rounded-full border border-white/10 px-3 py-1 text-white bg-transparent hover:bg-white hover:text-black">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-white/10 bg-white/5 p-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-white/70">Title</label>
              <input value={serviceForm.title} onChange={(e) => setServiceForm((s) => ({ ...s, title: e.target.value }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">Display order</label>
              <input type="number" min={1} value={serviceForm.display_order} onChange={(e) => setServiceForm((s) => ({ ...s, display_order: Number(e.target.value || 1) }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-white/70">Description</label>
              <textarea value={serviceForm.description} onChange={(e) => setServiceForm((s) => ({ ...s, description: e.target.value }))} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-white min-h-[80px]" />
            </div>
          </div>
          <div className="mt-3 flex gap-3">
            <button onClick={() => handleSaveService()} disabled={serviceSaving} className="rounded-full border border-white/70 bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black">{serviceSaving ? "Saving…" : serviceForm.id ? "Update" : "Add service"}</button>
            <button onClick={() => setServiceForm({ id: "", title: "", description: "", display_order: (services.length ?? 0) + 1 })} className="rounded-full border border-white/10 px-4 py-2 text-white bg-transparent hover:bg-white hover:text-black">Clear</button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSaveAll} disabled={saving} className="rounded-full border border-white/70 bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black">{saving ? "Saving…" : "Save Home content"}</button>
      </div>

      {message ? <div className="text-sm text-white/70">{message}</div> : null}
    </div>
  );
}
