"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { uploadToCloudinary } from "@/components/CloudinaryUpload";
import HtmlEditor from "./HtmlEditor";

type VenueCode = "NORTH" | "CENTRAL" | "SOUTH";

type FormState = {
  title: string;
  description: string;
  venueCode: VenueCode;
  venueName: string;
  address: string;
  mapUrl: string;
  waPhone: string;
  dateStart: string; // yyyy-MM-ddTHH:mm
  dateEnd: string;
  coverImage: string;
  capacity: number;
  isPublished: boolean;
  slug: string;
};

const FIELD =
  "w-full rounded-lg bg-white/5 border border-black/20 px-3 py-2 " +
  "placeholder-slate-400 outline-none " +
  "focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30";
const LABEL = "text-sm text-slate-600";

export default function AdminEventForm() {
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    venueCode: "CENTRAL",
    venueName: "",
    address: "",
    mapUrl: "",
    waPhone: "",
    dateStart: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    dateEnd: "",
    coverImage: "",
    capacity: 0,
    isPublished: true,
    slug: "",
  });
  const [msg, setMsg] = useState<string>("");

  // upload state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const payload = useMemo(
    () => ({
      ...form,
      dateStart: form.dateStart ? new Date(form.dateStart) : undefined,
      dateEnd: form.dateEnd ? new Date(form.dateEnd) : undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
    }),
    [form]
  );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (uploading) return; // prevent submit while uploading
    setMsg("Saving...");
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setMsg("✅ Event saved");
      window.location.href = `/admin/events/${data.event.id}`;
    } else {
      setMsg(`❌ ${data.error || "Server error"}`);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      {/* Title */}
      <div className="grid gap-1">
        <span className={LABEL}>Title</span>
        <input
          className={FIELD}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      {/* Description */}
      <div className="grid gap-1">
        <HtmlEditor
                label="Description"
                value={form.description}
                onChange={(html) => setForm({ ...form, description: html })}
         />
      </div>

      {/* Venue Name + Venue Code */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="grid gap-1">
          <span className={LABEL}>Venue Name</span>
          <input
            className={FIELD}
            value={form.venueName}
            onChange={(e) => setForm({ ...form, venueName: e.target.value })}
          />
        </div>
        <div className="grid gap-1">
          <span className={LABEL}>Venue Code</span>
          <select
            className={FIELD}
            value={form.venueCode}
            onChange={(e) =>
              setForm({ ...form, venueCode: e.target.value as VenueCode })
            }
          >
            <option value="CENTRAL">CENTRAL</option>
            <option value="SOUTH">SOUTH</option>
            <option value="NORTH">NORTH</option>
          </select>
        </div>
      </div>

      {/* Address */}
      <div className="grid gap-1">
        <span className={LABEL}>Address</span>
        <input
          className={FIELD}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </div>

      {/* Google Map URL */}
      <div className="grid gap-1">
        <span className={LABEL}>Google Map URL</span>
        <input
          className={FIELD}
          value={form.mapUrl}
          onChange={(e) => setForm({ ...form, mapUrl: e.target.value })}
          placeholder="https://maps.google.com/…"
        />
      </div>

      {/* WhatsApp Phone */}
      <div className="grid gap-1">
        <span className={LABEL}>WhatsApp Phone (optional)</span>
        <input
          className={FIELD}
          value={form.waPhone}
          onChange={(e) => setForm({ ...form, waPhone: e.target.value })}
          placeholder="+60xxxxxxxxx or 601XXXXXXXX"
        />
        <span className="text-xs text-slate-400">
          Used for attendee support links (e.g.,{" "}
          <span className="underline">wa.me/&lt;number&gt;</span>).
        </span>
      </div>

      {/* Start / End */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="grid gap-1">
          <span className={LABEL}>Start (local)</span>
          <input
            type="datetime-local"
            className={FIELD}
            value={form.dateStart}
            onChange={(e) => setForm({ ...form, dateStart: e.target.value })}
          />
        </div>
        <div className="grid gap-1">
          <span className={LABEL}>End (optional)</span>
          <input
            type="datetime-local"
            className={FIELD}
            value={form.dateEnd}
            onChange={(e) => setForm({ ...form, dateEnd: e.target.value })}
          />
        </div>
      </div>

      {/* Cover / Capacity */}
        <div className="grid gap-1">

        <span className={LABEL}>Cover Image URL</span>

          {/* Uploader + progress (uses uploadToCloudinary) */}
          <div className="mt-2 flex flex-col gap-2 text-sm">
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
                  // NOTE: uses onProgress supported by your util
                  const { url } = await uploadToCloudinary(file, {
                    folder: "events",
                    onProgress: (p: number) => setProgress(p),
                  } as any); // cast in case your util has a string overload
                  setForm((s) => ({ ...s, coverImage: url }));
                  setProgress(100);
                } catch (err: any) {
                  alert(err?.message || "Upload failed");
                } finally {
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
          </div>
          <input
            className={FIELD}
            value={form.coverImage}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            placeholder="Upload or paste image URL"
            name="coverImage"
          />
          <small className="text-slate-500">
              Upload → this field will auto-fill with the uploaded URL
            </small>
        </div>
  

      {/* Slug */}
      <div className="grid gap-1">
          <span className={LABEL}>Capacity (optional)</span>
          <input
            type="number"
            min={0}
            className={FIELD}
            value={form.capacity}
            onChange={(e) =>
              setForm({
                ...form,
                capacity: Number((e.target as HTMLInputElement).value),
              })
            }
          />
        </div>

      {/* Slug */}
      <div className="grid gap-1">
        <span className={LABEL}>Slug (optional – auto from title if empty)</span>
        <input
          className={FIELD}
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="redradar-open-day-kl"
        />
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
        <div />
        <label className="inline-flex select-none items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-white/30 bg-white/5 text-cyan-500 focus:ring-0"
            checked={form.isPublished}
            onChange={(e) =>
              setForm({
                ...form,
                isPublished: (e.target as HTMLInputElement).checked,
              })
            }
          />
          <span>Published?</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={uploading}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
            uploading
              ? "bg-cyan-500/40 text-slate-800 cursor-not-allowed"
              : "bg-cyan-500/90 text-slate-900 hover:bg-cyan-400"
          }`}
        >
          {uploading ? "Uploading…" : "Save"}
        </button>

        <Link href="/admin" className="inline-flex items-center gap-2 bg-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-400">
            Cancel
          </Link>

        <span className="text-sm text-slate-400">{msg}</span>
        <div className="ml-auto text-xs text-slate-400">
          Need templates?{" "}
          <Link href="/admin/templates" className="underline">
            Open templates
          </Link>
        </div>
      </div>
    </form>
  );
}
