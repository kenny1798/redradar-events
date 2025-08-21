"use client";
import { useState } from "react";
import { uploadToCloudinary } from "@/components/CloudinaryUpload";
import HtmlEditor from "./HtmlEditor";

type VenueCode = "NORTH" | "CENTRAL" | "SOUTH";

type Template = {
  id: string;
  name: string;
  title: string;
  description?: string | null;
  venueName: string;
  venueCode: VenueCode;
  address?: string | null;
  mapUrl?: string | null;
  waPhone?: string | null;
  coverImage?: string | null;
  capacity?: number | null;
};

const FIELD =
  "w-full rounded-lg bg-white/5 border border-slate-300 px-3 py-2 " +
  "text-slate-900 placeholder-slate-400 outline-none " +
  "focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30";
const LABEL = "text-sm  text-slate-500";

export default function TemplateEditForm({ template }: { template: Template }) {
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [desc, setDesc] = useState<string>(template.description ?? "");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const body = {
      name: String(fd.get("name") || ""),
      title: String(fd.get("title") || ""),
      description: (fd.get("description") as string) || undefined,
      venueName: String(fd.get("venueName") || ""),
      venueCode: (fd.get("venueCode") as VenueCode) || "CENTRAL",
      address: (fd.get("address") as string) || undefined,
      mapUrl: (fd.get("mapUrl") as string) || undefined,
      waPhone: (fd.get("waPhone") as string) || undefined,
      coverImage: (fd.get("coverImage") as string) || undefined,
      capacity: fd.get("capacity") ? Number(fd.get("capacity")) : undefined,
    };

    setMsg("Saving...");
    const res = await fetch(`/api/admin/templates/${template.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      window.location.href = "/admin/templates";
    } else {
      setMsg(data.error || "Save failed");
    }
  }

  async function onDelete() {
    if (!confirm("Delete this template?")) return;
    const res = await fetch(`/api/admin/templates/${template.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      window.location.href = "/admin/templates";
    } else {
      alert("Delete failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-1">
        <label htmlFor="name" className={LABEL}>Template name</label>
        <input id="name" name="name" defaultValue={template.name} className={FIELD} required />
      </div>

      <div className="grid gap-1">
        <label htmlFor="title" className={LABEL}>Default title</label>
        <input id="title" name="title" defaultValue={template.title} className={FIELD} required />
      </div>

      <div className="grid gap-1">
        <HtmlEditor label="Description" value={desc} onChange={setDesc}  />
        <input type="hidden" name="description" id="description" value={desc} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <label htmlFor="venueName" className={LABEL}>Venue name</label>
          <input id="venueName" name="venueName" defaultValue={template.venueName} className={FIELD} required />
        </div>
        <div className="grid gap-1">
          <label htmlFor="venueCode" className={LABEL}>Venue code</label>
          <select id="venueCode" name="venueCode" defaultValue={template.venueCode} className={FIELD}>
            <option value="CENTRAL">CENTRAL</option>
            <option value="SOUTH">SOUTH</option>
            <option value="NORTH">NORTH</option>
          </select>
        </div>
      </div>

      <div className="grid gap-1">
        <label htmlFor="address" className={LABEL}>Address</label>
        <input id="address" name="address" defaultValue={template.address ?? ""} className={FIELD} />
      </div>

      <div className="grid gap-1">
        <label htmlFor="mapUrl" className={LABEL}>Google Maps URL</label>
        <input id="mapUrl" name="mapUrl" defaultValue={template.mapUrl ?? ""} className={FIELD} />
      </div>

      <div className="grid gap-1">
        <label htmlFor="waPhone" className={LABEL}>WhatsApp Number</label>
        <input id="waPhone" name="waPhone" defaultValue={template.waPhone ?? ""} className={FIELD} />
      </div>

       {/* File upload + progress */}
       

      <div className="grid gap-1">
        <label htmlFor="coverImage" className={LABEL}>Cover image URL</label>
        <div className="flex flex-col gap-2 text-sm">
        <input
          type="file"
          className={FIELD}
          accept="image/*"
          disabled={uploading}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              setUploading(true);
              setProgress(0);
              const { url } = await uploadToCloudinary(f, {
                folder: "templates",
                onProgress: (p) => setProgress(p),
              });
              // auto-isi ke field coverImage
              const input = document.querySelector<HTMLInputElement>('input[name="coverImage"]');
              if (input) input.value = url;
              setProgress(100);
            } catch (err: any) {
              alert(err?.message || "Upload failed");
            } finally {
              // bagi 400ms untuk bar capai 100% sebelum hide
              setTimeout(() => {
                setUploading(false);
                setProgress(0);
              }, 400);
            }
          }}
        />

        {uploading && (
          <div className="h-2 w-full rounded bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
        <input id="coverImage" name="coverImage" defaultValue={template.coverImage ?? ""} className={FIELD} readOnly />
        <small className="text-slate-500">Upload → field "Cover image URL" will auto-fill</small>
      </div>


      <div className="grid gap-1">
        <label htmlFor="capacity" className={LABEL}>Capacity</label>
        <input id="capacity" name="capacity" type="number" defaultValue={template.capacity ?? 0} className={FIELD} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-lg bg-cyan-500/90 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-cyan-400"
        >
          Save
        </button>
        <a href="/admin/templates" className="rounded-lg border border-gray-300 bg-gray-300 px-4 py-2 text-sm hover:bg-gray-400">
          Cancel
        </a>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg bg-red-600/20 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/30"
        >
          Delete
        </button>
        <a
          href={`/admin/templates/${template.id}/use`}
          className="rounded-lg border border-green-300 bg-green-300 px-4 py-2 text-sm hover:bg-green-400"
        >
          Create from template
        </a>
        <span className="ml-auto text-sm text-slate-400">{msg}</span>
      </div>
    </form>
  );
}
