"use client";
import { useState } from "react";
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
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 " +
  "text-slate-900 placeholder-slate-400 outline-none " +
  "focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30";
const LABEL = "text-sm text-slate-500";

/** Helper: upload to Cloudinary with progress (uses your /api/admin/cloudinary/sign) */
async function uploadWithProgress(
  file: File,
  onProgress: (pct: number) => void,
  folder?: string
): Promise<{ url: string; publicId: string }> {
  // 1) get signature
  const sigRes = await fetch("/api/admin/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!sigRes.ok) throw new Error("Failed to get Cloudinary signature");
  const { timestamp, signature, apiKey, cloudName, folder: usedFolder } =
    await sigRes.json();

  // 2) prepare form
  const form = new FormData();
  form.append("file", file);
  form.append("timestamp", String(timestamp));
  form.append("api_key", apiKey);
  form.append("signature", signature);
  form.append("folder", usedFolder);

  // 3) use XHR for progress
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const xhr = new XMLHttpRequest();

  return await new Promise((resolve, reject) => {
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ url: json.secure_url as string, publicId: json.public_id as string });
        } else {
          reject(new Error(json?.error?.message || "Cloudinary upload failed"));
        }
      } catch {
        reject(new Error("Cloudinary upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.open("POST", endpoint);
    xhr.send(form);
  });
}

export default function UseTemplateForm({ template }: { template: Template }) {
  const [msg, setMsg] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [desc, setDesc] = useState<string>(template.description ?? "");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget as HTMLFormElement & {
      dateStart: HTMLInputElement;
      dateEnd: HTMLInputElement;
      slug: HTMLInputElement;
      isPublished: HTMLInputElement;
      title: HTMLInputElement;
      venueName: HTMLInputElement;
      venueCode: HTMLSelectElement;
      address: HTMLInputElement;
      mapUrl: HTMLInputElement;
      waPhone: HTMLInputElement;
      coverImage: HTMLInputElement;
      capacity: HTMLInputElement;
    };

    const body = {
      dateStart: f.dateStart.value,
      dateEnd: f.dateEnd.value || undefined,
      slug: f.slug.value,
      isPublished: f.isPublished.checked,
      overrides: {
        title: f.title.value || undefined,
        venueName: f.venueName.value || undefined,
        venueCode: (f.venueCode.value as VenueCode) || undefined,
        address: f.address.value || undefined,
        mapUrl: f.mapUrl.value || undefined,
        waPhone: f.waPhone.value || undefined,
        coverImage: f.coverImage.value || undefined,
        capacity: f.capacity.value ? Number(f.capacity.value) : undefined,
      },
    };

    setMsg("Creating...");
    const res = await fetch(`/api/admin/templates/${template.id}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      window.location.href = `/admin/events/${data.event.id}`;
    } else {
      setMsg(data.error || "Create failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {/* Dates */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className={LABEL}>Start</span>
          <input type="datetime-local" name="dateStart" className={FIELD} required />
        </label>
        <label className="grid gap-1">
          <span className={LABEL}>End</span>
          <input type="datetime-local" name="dateEnd" className={FIELD} />
        </label>
      </div>

      {/* Slug + Publish */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className={LABEL}>Slug</span>
          <input name="slug" className={FIELD} placeholder="auto-from-title-date" />
        </label>
        <label className="grid gap-1">
          <span className={LABEL}>Publish?</span>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked
              className="h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-400/30"
            />
            <span className="text-slate-600 text-sm">Make event public</span>
          </div>
        </label>
      </div>

      <h3 className="mt-2 text-base font-semibold text-slate-700">Overrides (optional)</h3>

      {/* Title */}
      <label className="grid gap-1">
        <span className={LABEL}>Title</span>
        <input
          name="title"
          className={FIELD}
          placeholder={`Title (default: ${template.title})`}
        />
      </label>

      <div className="grid gap-1">
         <HtmlEditor label="Description" value={desc} onChange={setDesc}  />
         <input type="hidden" name="description" id="description" value={desc} />
       </div>

      {/* Venue */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className={LABEL}>Venue</span>
          <input
            name="venueName"
            className={FIELD}
            placeholder={`Venue (default: ${template.venueName})`}
          />
        </label>
        <label className="grid gap-1">
          <span className={LABEL}>Venue code</span>
          <select name="venueCode" defaultValue="" className={FIELD}>
            <option value="">(keep: {template.venueCode})</option>
            <option value="CENTRAL">CENTRAL</option>
            <option value="SOUTH">SOUTH</option>
            <option value="NORTH">NORTH</option>
          </select>
        </label>
      </div>

      {/* Address / Map */}
      <label className="grid gap-1">
        <span className={LABEL}>Address</span>
        <input
          name="address"
          className={FIELD}
          placeholder={`Address (default: ${template.address ?? "-"})`}
        />
      </label>
      <label className="grid gap-1">
        <span className={LABEL}>Map URL</span>
        <input
          name="mapUrl"
          className={FIELD}
          placeholder={`Map URL (default: ${template.mapUrl ?? "-"})`}
        />
      </label>

      <label className="grid gap-1">
        <span className={LABEL}>WhatsApp Number</span>
        <input
          name="mapUrl"
          className={FIELD}
          placeholder={`WhatsApp Number (default: ${template.waPhone ?? "-"})`}
        />
      </label>

      {/* Cover image + uploader */}
      <label className="grid gap-1">
        <span className={LABEL}>Cover image URL</span>
        <div className="flex flex-col gap-2 text-sm">
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              setUploading(true);
              setProgress(0);
              const { url } = await uploadWithProgress(file, setProgress, "events");
              // auto fill to coverImage field
              const input = document.querySelector<HTMLInputElement>('input[name="coverImage"]');
              if (input) input.value = url;
              setProgress(100);
            } catch (err: any) {
              alert(err?.message || "Upload failed");
            } finally {
              // biar bar kekal sekejap bila capai 100%
              setTimeout(() => {
                setUploading(false);
                setProgress(0);
              }, 400);
            }
          }}
          className={FIELD}
        />

        {uploading && (
          <div className="h-2 w-full overflow-hidden rounded bg-slate-200">
            <div
              className="h-full bg-cyan-500 transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <small className="text-slate-500">
          Upload → the “Cover image URL” field will be auto-filled
        </small>
      </div>

        <input
          name="coverImage"
          className={FIELD}
          placeholder={`Cover image (default: ${template.coverImage ?? "-"})`}
        />
      </label>



      {/* Capacity */}
      <label className="grid gap-1">
        <span className={LABEL}>Capacity</span>
        <input
          name="capacity"
          type="number"
          className={FIELD}
          placeholder={`Capacity (default: ${template.capacity ?? 0})`}
        />
      </label>

      {/* Actions */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={uploading}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            uploading
              ? "bg-cyan-500/40 text-slate-800 cursor-not-allowed"
              : "bg-cyan-500/90 text-slate-900 hover:bg-cyan-400"
          }`}
        >
          {uploading ? "Uploading…" : "Create Event"}
        </button>
        <a
          href="/admin/templates"
          className="text-sm text-slate-600 hover:underline"
        >
          Cancel
        </a>
        <span className="ml-auto text-sm text-slate-500">{msg}</span>
      </div>
    </form>
  );
}
