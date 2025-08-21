"use client";
import React, { useState } from "react";
import Link from "next/link";
import { uploadToCloudinary } from "@/components/CloudinaryUpload";
import HtmlEditor from "@/components/HtmlEditor";

type VenueCode = "CENTRAL" | "SOUTH" | "NORTH";

type TemplateForm = {
  name: string;
  title: string;
  description: string;
  venueName: string;
  venueCode: VenueCode;
  address: string;
  mapUrl: string;
  waPhone: string;
  coverImage: string;
  capacity: number;
};

const FIELD =
  "w-full rounded-lg bg-white/5 border border-slate-400 px-3 py-2 " +
  "placeholder-slate-400 outline-none " +
  "focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30";
const LABEL = "text-sm text-slate-500";

export default function NewTemplate() {
  const [form, setForm] = useState<TemplateForm>({
    name: "",
    title: "",
    description: "",
    venueName: "",
    venueCode: "CENTRAL",
    address: "",
    mapUrl: "",
    waPhone: "",
    coverImage: "",
    capacity: 0,
  });
  const [msg, setMsg] = useState<string>("");

  // upload state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (uploading) return; // elak submit masa upload
    setMsg("Saving...");
    const res = await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      window.location.href = `/admin/templates`;
    } else {
      setMsg(data?.error || "Server error");
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-wide">New Template</h1>
        <Link
          href="/admin/templates"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
        >
          Back
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="grid gap-4">
        {/* Template name */}
        <div className="grid gap-1">
          <label htmlFor="name" className={LABEL}>
            Template name (for admin reference)
          </label>
          <input
            id="name"
            className={FIELD}
            placeholder="e.g. Open Day - HQ"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        {/* Default title */}
        <div className="grid gap-1">
          <label htmlFor="title" className={LABEL}>
            Default title
          </label>
          <input
            id="title"
            className={FIELD}
            placeholder="e.g. RedRadar Open Day"
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

        {/* Venue name + code */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-1">
            <label htmlFor="venueName" className={LABEL}>
              Venue name
            </label>
            <input
              id="venueName"
              className={FIELD}
              placeholder="e.g. RedRadar HQ"
              value={form.venueName}
              onChange={(e) => setForm({ ...form, venueName: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="venueCode" className={LABEL}>
              Venue code
            </label>
            <select
              id="venueCode"
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
          <label htmlFor="address" className={LABEL}>
            Address
          </label>
          <input
            id="address"
            className={FIELD}
            placeholder="Street, city, state"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        {/* Google Maps URL */}
        <div className="grid gap-1">
          <label htmlFor="mapUrl" className={LABEL}>
            Google Maps URL
          </label>
          <input
            id="mapUrl"
            className={FIELD}
            placeholder="https://maps.google.com/…"
            value={form.mapUrl}
            onChange={(e) => setForm({ ...form, mapUrl: e.target.value })}
          />
        </div>

        <div className="grid gap-1">
        <label htmlFor="waPhone" className={LABEL}>
            Whatsapp Phone (Optional)
          </label>
        <input
          className={FIELD}
          value={form.waPhone}
          onChange={(e) => setForm({ ...form, waPhone: e.target.value })}
          placeholder="60xxxxxxxxx or 601XXXXXXXX"
        />
        <span className="text-xs text-slate-400">
          Used for attendee support links (e.g., <span className="underline">wa.me/&lt;number&gt;</span>).
        </span>
      </div>

        {/* Cover + Capacity */}
          <div className="grid gap-1">
          <label htmlFor="coverImage" className={LABEL}>
              Cover image URL
            </label>
            {/* File uploader + progress */}
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
                    // util supports { folder, onProgress }
                    const { url } = await uploadToCloudinary(file, {
                      folder: "templates",
                      onProgress: (p: number) => setProgress(p),
                    } as any);
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
              id="coverImage"
              className={FIELD}
              placeholder="upload image or paste URL"
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            />
            <small className="text-slate-500">
                Upload → the field above will auto-fill with the image URL
              </small>


          </div>

          <div className="grid gap-1">
            <label htmlFor="capacity" className={LABEL}>
              Capacity
            </label>
            <input
              id="capacity"
              type="number"
              min={0}
              className={FIELD}
              placeholder="0"
              value={form.capacity}
              onChange={(e) =>
                setForm({ ...form, capacity: Number(e.target.value) })
              }
            />
          </div>


        {/* Actions */}
        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={uploading}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
              uploading
                ? "bg-cyan-500/40 text-slate-800 cursor-not-allowed"
                : "bg-cyan-500/90 text-slate-900 hover:bg-cyan-400"
            }`}
          >
            {uploading ? "Uploading…" : "Save Template"}
          </button>

          <Link
            href="/admin/templates"
            className="text-sm text-slate-500 hover:underline"
          >
            Cancel
          </Link>

          <span className="ml-auto text-sm">{msg}</span>
        </div>
      </form>
    </main>
  );
}
