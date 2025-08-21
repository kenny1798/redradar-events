"use client";
import { useState } from "react";

export default function RsvpForm({ eventId }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    company: "",
    notes: "",
  });
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("Submitting...");
    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, ...form }),
    });
    const data = await res.json();
    if (res.ok && data.ok) setMsg("Terima kasih! RSVP diterima.");
    else setMsg(data.error || "Ralat server.");
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <input
        required
        placeholder="Nama penuh"
        value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
      />
      <input
        required
        placeholder="No. Telefon"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <input
        placeholder="Email (optional)"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder="Syarikat (optional)"
        value={form.company}
        onChange={(e) => setForm({ ...form, company: e.target.value })}
      />
      <textarea
        placeholder="Nota (optional)"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
      <button type="submit">Hantar RSVP</button>
      <div>{msg}</div>
    </form>
  );
}
