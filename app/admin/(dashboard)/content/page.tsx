"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";

type Faq = { id: string; category: string; question: string; answer: string };
type ArenaPhotoRow = { id: string; url: string; caption: string | null };

const TABS = ["Hero", "Home & Logo", "Business & Contact", "About", "Arena", "FAQs"] as const;

export default function WebsiteContentPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Hero");
  const [settings, setSettings] = useState<Record<string, Record<string, unknown>>>({});
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [arenaPhotos, setArenaPhotos] = useState<ArenaPhotoRow[]>([]);
  const [newFaq, setNewFaq] = useState({ category: "General", question: "", answer: "" });
  const [loading, setLoading] = useState(true);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingAboutImage, setUploadingAboutImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingArenaPhoto, setUploadingArenaPhoto] = useState(false);

  const heroFileRef = useRef<HTMLInputElement>(null);
  const aboutImageFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const arenaFileRef = useRef<HTMLInputElement>(null);

  const loadArenaPhotos = useCallback(async () => {
    const res = await fetch("/api/admin/arena-photos");
    const json = await res.json();
    setArenaPhotos(json.photos || []);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/settings").then((r) => r.json()),
      fetch("/api/admin/faqs").then((r) => r.json()),
    ]).then(([s, f]) => {
      setSettings(s.settings || {});
      setFaqs(f.faqs || []);
      setLoading(false);
    });
    loadArenaPhotos();
  }, [loadArenaPhotos]);

  function set(key: string, field: string, value: string) {
    setSettings((s) => ({ ...s, [key]: { ...(s[key] || {}), [field]: value } }));
  }

  async function saveKey(key: string) {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: settings[key] || {} }),
    });
    if (!res.ok) {
      toast.error("Failed to save.");
      return;
    }
    toast.success("Saved.");
  }

  async function uploadMedia(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Upload failed.");
      return null;
    }
    return json.url as string;
  }

  async function handleHeroUpload(file: File) {
    setUploadingHero(true);
    const url = await uploadMedia(file);
    setUploadingHero(false);
    if (!url) return;
    set("media", "heroImageUrl", url);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "media", value: { ...(settings.media || {}), heroImageUrl: url } }),
    });
    if (res.ok) toast.success("Home page background updated.");
  }

  async function handleAboutImageUpload(file: File) {
    setUploadingAboutImage(true);
    const url = await uploadMedia(file);
    setUploadingAboutImage(false);
    if (!url) return;
    set("media", "aboutImageUrl", url);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "media", value: { ...(settings.media || {}), aboutImageUrl: url } }),
    });
    if (res.ok) toast.success("About section photo updated.");
  }

  async function handleLogoUpload(file: File) {
    setUploadingLogo(true);
    const url = await uploadMedia(file);
    setUploadingLogo(false);
    if (!url) return;
    set("media", "logoUrl", url);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "media", value: { ...(settings.media || {}), logoUrl: url } }),
    });
    if (res.ok) toast.success("Logo updated.");
  }

  async function handleArenaPhotoUpload(file: File) {
    setUploadingArenaPhoto(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/arena-photos", { method: "POST", body: fd });
    const json = await res.json();
    setUploadingArenaPhoto(false);
    if (!res.ok) {
      toast.error(json.error || "Upload failed.");
      return;
    }
    toast.success("Arena photo added.");
    loadArenaPhotos();
  }

  async function deleteArenaPhoto(id: string) {
    if (!confirm("Remove this arena photo?")) return;
    const res = await fetch(`/api/admin/arena-photos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete.");
      return;
    }
    setArenaPhotos((p) => p.filter((x) => x.id !== id));
  }

  async function addFaq() {
    if (!newFaq.question || !newFaq.answer) return;
    const res = await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFaq),
    });
    if (!res.ok) {
      toast.error("Failed to add FAQ.");
      return;
    }
    const json = await res.json();
    setFaqs((f) => [...f, json.faq]);
    setNewFaq({ category: "General", question: "", answer: "" });
    toast.success("FAQ added.");
  }

  async function deleteFaq(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete.");
      return;
    }
    setFaqs((f) => f.filter((x) => x.id !== id));
  }

  if (loading) return <p className="text-sm text-muted">Loading...</p>;

  const business = settings.business || {};
  const hero = settings.hero || {};
  const about = settings.about || {};
  const arena = settings.arena || {};
  const media = settings.media || {};
  const stats = settings.stats || {};

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Website Content</h1>
      <p className="mt-1 text-sm text-muted">Edit content shown on the public website without touching code.</p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium ${
              tab === t ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 max-w-3xl">
        {tab === "Hero" && (
          <div className="card space-y-4">
            <div>
              <label className="label">Hero Heading</label>
              <textarea className="input min-h-20" value={(hero.heading as string) || ""} onChange={(e) => set("hero", "heading", e.target.value)} />
            </div>
            <div>
              <label className="label">Hero Subheading</label>
              <textarea className="input min-h-24" value={(hero.subheading as string) || ""} onChange={(e) => set("hero", "subheading", e.target.value)} />
            </div>
            <button className="btn-accent" onClick={() => saveKey("hero")}>Save Hero Content</button>
          </div>
        )}

        {tab === "Home & Logo" && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-display text-lg font-bold">Home Page Background Photo</h3>
              <p className="mt-1 text-sm text-muted">
                Shown behind the hero heading on the home page. Leave unset to automatically use the
                first photo from the Arena gallery instead.
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-24 w-40 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-2">
                  {media.heroImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={media.heroImageUrl as string} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon size={20} className="text-muted" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={heroFileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleHeroUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <button className="btn-outline" disabled={uploadingHero} onClick={() => heroFileRef.current?.click()}>
                    <Upload size={16} /> {uploadingHero ? "Uploading..." : "Upload New Photo"}
                  </button>
                  {media.heroImageUrl ? (
                    <button
                      className="text-left text-xs text-danger hover:underline"
                      onClick={async () => {
                        set("media", "heroImageUrl", "");
                        await fetch("/api/admin/settings", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ key: "media", value: { ...media, heroImageUrl: "" } }),
                        });
                        toast.success("Reverted to default arena photo.");
                      }}
                    >
                      Remove (use default arena photo)
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-display text-lg font-bold">About Section Photo</h3>
              <p className="mt-1 text-sm text-muted">
                Shown next to the &quot;About&quot; text on the home page. Leave unset to use an arena photo.
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-24 w-40 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-2">
                  {media.aboutImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={media.aboutImageUrl as string} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon size={20} className="text-muted" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={aboutImageFileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAboutImageUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <button className="btn-outline" disabled={uploadingAboutImage} onClick={() => aboutImageFileRef.current?.click()}>
                    <Upload size={16} /> {uploadingAboutImage ? "Uploading..." : "Upload New Photo"}
                  </button>
                  {media.aboutImageUrl ? (
                    <button
                      className="text-left text-xs text-danger hover:underline"
                      onClick={async () => {
                        set("media", "aboutImageUrl", "");
                        await fetch("/api/admin/settings", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ key: "media", value: { ...media, aboutImageUrl: "" } }),
                        });
                        toast.success("Reverted to default arena photo.");
                      }}
                    >
                      Remove (use default arena photo)
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-display text-lg font-bold">Site Logo</h3>
              <p className="mt-1 text-sm text-muted">Shown in the navigation bar on every page.</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={(media.logoUrl as string) || "/brand/mark-512.png"} alt="" className="h-full w-full object-contain" />
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={logoFileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <button className="btn-outline" disabled={uploadingLogo} onClick={() => logoFileRef.current?.click()}>
                    <Upload size={16} /> {uploadingLogo ? "Uploading..." : "Upload New Logo"}
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-display text-lg font-bold">Home Page Stats</h3>
              <p className="mt-1 text-sm text-muted">
                The stat callouts shown under the hero on the home page (e.g. &quot;10+ Events Supported&quot;).
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {([1, 2] as const).map((n) => (
                  <div key={n} className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label">Stat {n} Value</label>
                      <input
                        className="input"
                        value={(stats[`stat${n}Value`] as string) || ""}
                        onChange={(e) => set("stats", `stat${n}Value`, e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Stat {n} Label</label>
                      <input
                        className="input"
                        value={(stats[`stat${n}Label`] as string) || ""}
                        onChange={(e) => set("stats", `stat${n}Label`, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-accent mt-4" onClick={() => saveKey("stats")}>Save Stats</button>
            </div>
          </div>
        )}

        {tab === "Business & Contact" && (
          <div className="card space-y-4">
            {["businessName", "tagline", "phone", "whatsapp", "email", "address", "googleMapsUrl"].map((f) => (
              <div key={f}>
                <label className="label">{f.replace(/([A-Z])/g, " $1")}</label>
                <input className="input" value={(business[f] as string) || ""} onChange={(e) => set("business", f, e.target.value)} />
              </div>
            ))}
            <button className="btn-accent" onClick={() => saveKey("business")}>Save Business Info</button>
          </div>
        )}

        {tab === "About" && (
          <div className="card space-y-4">
            {["whoWeAre", "whatWeDo", "capabilities", "experience", "mission", "vision"].map((f) => (
              <div key={f}>
                <label className="label">{f.replace(/([A-Z])/g, " $1")}</label>
                <textarea className="input min-h-20" value={(about[f] as string) || ""} onChange={(e) => set("about", f, e.target.value)} />
              </div>
            ))}
            <button className="btn-accent" onClick={() => saveKey("about")}>Save About Content</button>
          </div>
        )}

        {tab === "Arena" && (
          <div className="space-y-6">
            <div className="card space-y-4">
              <div>
                <label className="label">Arena Dimensions</label>
                <input
                  className="input"
                  placeholder="e.g. 16 ft × 16 ft × 8 ft playing area (L × W × H)"
                  value={(arena.dimensions as string) || ""}
                  onChange={(e) => set("arena", "dimensions", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Base Floor Sheet</label>
                <input
                  className="input"
                  placeholder="e.g. 5mm MS (Mild Steel) sheet"
                  value={(arena.baseSheet as string) || ""}
                  onChange={(e) => set("arena", "baseSheet", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Side Wall Polycarbonate</label>
                <input
                  className="input"
                  placeholder="e.g. 10mm thick polycarbonate side panels"
                  value={(arena.sidePolycarbonate as string) || ""}
                  onChange={(e) => set("arena", "sidePolycarbonate", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Top Cover Polycarbonate</label>
                <input
                  className="input"
                  placeholder="e.g. 6mm thick polycarbonate top cover"
                  value={(arena.topPolycarbonate as string) || ""}
                  onChange={(e) => set("arena", "topPolycarbonate", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Arena Categories (comma separated)</label>
                <input
                  className="input"
                  placeholder="e.g. 8kg, 15kg, 30kg, 60kg"
                  value={(arena.categories as string) || ""}
                  onChange={(e) => set("arena", "categories", e.target.value)}
                />
                <p className="mt-1 text-xs text-muted">
                  Shown as tags on the Robotics Arenas service card, and as the category options in the
                  Arena Enquiry form.
                </p>
              </div>
              <button className="btn-accent" onClick={() => saveKey("arena")}>Save Arena Specifications</button>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Arena Gallery Photos</h3>
                <input
                  ref={arenaFileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleArenaPhotoUpload(file);
                    e.target.value = "";
                  }}
                />
                <button className="btn-outline" disabled={uploadingArenaPhoto} onClick={() => arenaFileRef.current?.click()}>
                  <Upload size={16} /> {uploadingArenaPhoto ? "Uploading..." : "Upload Photo"}
                </button>
              </div>
              <p className="mt-1 text-sm text-muted">Shown in the Arena page gallery and on the home page.</p>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {arenaPhotos.map((p) => (
                  <div key={p.id} className="group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" className="aspect-square w-full rounded-md border border-border object-cover" />
                    <button
                      onClick={() => deleteArenaPhoto(p.id)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-danger/90 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {arenaPhotos.length === 0 && (
                  <p className="col-span-full text-sm text-muted">No arena photos yet. Upload one above.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "FAQs" && (
          <div className="space-y-4">
            <div className="card space-y-3">
              <h3 className="font-semibold">Add FAQ</h3>
              <select className="input" value={newFaq.category} onChange={(e) => setNewFaq((f) => ({ ...f, category: e.target.value }))}>
                <option>General</option>
                <option>Arena</option>
                <option>Training</option>
                <option>Machining</option>
              </select>
              <input className="input" placeholder="Question" value={newFaq.question} onChange={(e) => setNewFaq((f) => ({ ...f, question: e.target.value }))} />
              <textarea className="input min-h-16" placeholder="Answer" value={newFaq.answer} onChange={(e) => setNewFaq((f) => ({ ...f, answer: e.target.value }))} />
              <button className="btn-accent" onClick={addFaq}><Plus size={16} /> Add FAQ</button>
            </div>
            {faqs.map((f) => (
              <div key={f.id} className="card flex items-start justify-between gap-4">
                <div>
                  <span className="badge border-accent/30 bg-accent/10 text-accent">{f.category}</span>
                  <p className="mt-2 font-medium">{f.question}</p>
                  <p className="mt-1 text-sm text-muted">{f.answer}</p>
                </div>
                <button onClick={() => deleteFaq(f.id)} className="text-danger hover:opacity-75" aria-label="Delete"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
