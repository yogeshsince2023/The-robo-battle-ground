"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Image as ImageIcon, Upload } from "lucide-react";

type ProjectImage = { id: string; url: string; caption: string | null };
type Project = {
  id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  detailedDescription: string | null;
  year: string | null;
  technologies: string | null;
  clientOrEvent: string | null;
  coverImageUrl: string | null;
  status: string;
  images: ProjectImage[];
};

const CATEGORIES = [
  "Robotics", "Robowar", "Automation", "Electronics", "Embedded Systems",
  "CNC", "Mechanical", "3D Printing", "Industrial Projects", "Custom Engineering",
];

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [galleryFor, setGalleryFor] = useState<Project | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/projects");
    const json = await res.json();
    setProjects(json.projects || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setForm({ name: "", category: "", shortDescription: "", detailedDescription: "", year: "", technologies: "", clientOrEvent: "", coverImageUrl: "", status: "Published" });
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(p: Project) {
    setForm({
      name: p.name, category: p.category, shortDescription: p.shortDescription,
      detailedDescription: p.detailedDescription || "", year: p.year || "",
      technologies: p.technologies || "", clientOrEvent: p.clientOrEvent || "",
      coverImageUrl: p.coverImageUrl || "", status: p.status,
    });
    setEditing(p);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/admin/projects/${editing.id}` : "/api/admin/projects";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Failed to save.");
      return;
    }
    toast.success(editing ? "Updated." : "Created.");
    setModalOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project and its images? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete.");
      return;
    }
    toast.success("Deleted.");
    load();
  }

  async function handleUploadImage(file: File) {
    if (!galleryFor) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/admin/projects/${galleryFor.id}/images`, { method: "POST", body: fd });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error || "Upload failed.");
      return;
    }
    toast.success("Image uploaded.");
    const updated = await fetch("/api/admin/projects").then((r) => r.json());
    setProjects(updated.projects || []);
    setGalleryFor(updated.projects.find((p: Project) => p.id === galleryFor.id) || null);
  }

  async function handleDeleteImage(imageId: string) {
    if (!galleryFor) return;
    const res = await fetch(`/api/admin/projects/${galleryFor.id}/images/${imageId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete image.");
      return;
    }
    const updated = await fetch("/api/admin/projects").then((r) => r.json());
    setProjects(updated.projects || []);
    setGalleryFor(updated.projects.find((p: Project) => p.id === galleryFor.id) || null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Projects</h1>
          <p className="mt-1 text-sm text-muted">Manage the public engineering projects portfolio.</p>
        </div>
        <button onClick={openCreate} className="btn-accent"><Plus size={16} /> Add Project</button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-surface-2">
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Images</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3">{p.year}</td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setGalleryFor(p)} className="inline-flex items-center gap-1.5 text-accent hover:underline">
                    <ImageIcon size={14} /> {p.images.length}
                  </button>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(p)} className="text-accent hover:opacity-75" aria-label="Edit"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="text-danger hover:opacity-75" aria-label="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No projects yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">{editing ? "Edit" : "Add"} Project</h2>
              <button onClick={() => setModalOpen(false)} aria-label="Close"><X size={20} /></button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Project Name *</label>
                <input className="input" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Category *</label>
                <select className="input" value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}>
                  <option value="">Select...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Year</label>
                <input className="input" value={form.year} onChange={(e) => setForm((s) => ({ ...s, year: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Short Description</label>
                <textarea className="input min-h-20" value={form.shortDescription} onChange={(e) => setForm((s) => ({ ...s, shortDescription: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Detailed Description</label>
                <textarea className="input min-h-28" value={form.detailedDescription} onChange={(e) => setForm((s) => ({ ...s, detailedDescription: e.target.value }))} />
              </div>
              <div>
                <label className="label">Technologies (comma separated)</label>
                <input className="input" value={form.technologies} onChange={(e) => setForm((s) => ({ ...s, technologies: e.target.value }))} />
              </div>
              <div>
                <label className="label">Client / Event</label>
                <input className="input" value={form.clientOrEvent} onChange={(e) => setForm((s) => ({ ...s, clientOrEvent: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Cover Image URL</label>
                <input className="input" value={form.coverImageUrl} onChange={(e) => setForm((s) => ({ ...s, coverImageUrl: e.target.value }))} placeholder="/uploads/projects/... or external URL" />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-accent">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {galleryFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Gallery — {galleryFor.name}</h2>
              <button onClick={() => setGalleryFor(null)} aria-label="Close"><X size={20} /></button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {galleryFor.images.map((img) => (
                <div key={img.id} className="group relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="aspect-square w-full rounded-md border border-border object-cover" />
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute right-1.5 top-1.5 rounded-full bg-danger/90 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadImage(file);
                e.target.value = "";
              }}
            />
            <button onClick={() => fileInputRef.current?.click()} className="btn-outline mt-5">
              <Upload size={16} /> Upload Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
