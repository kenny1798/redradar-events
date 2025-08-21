"use client";
import { safeFormat } from "@/utils/date";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { coverHero } from "@/lib/cloudinary";

type EventDTO = {
  event: {
    slug: string;
    title: string;
    dateStart: string | null;
    venueName: string;
    venueCode: string;
    capacity: number | null;
    coverImage?: string | null;
    // 👇 tambah
    waPhone?: string | null;
  };
};

// normalise nombor ke msisdn digit sahaja (cth: 60123456789)
function normalizeMsisdn(input?: string | null, defaultCountry = "60") {
  if (!input) return "";
  let p = input.replace(/\D/g, "");
  if (p.startsWith("00")) p = p.slice(2);
  if (p.startsWith("0")) p = defaultCountry + p.slice(1);
  return p;
}

export default function RsvpForm({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true);
  const [evt, setEvt] = useState<EventDTO["event"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { id: string }>(null);

  // 👇 state untuk redirect WA
  const [timer, setTimer] = useState(5);
  const waUrl = useMemo(() => {
    if (!evt?.waPhone) return "";
    const to = normalizeMsisdn(evt.waPhone, "60");
    if (!to) return "";
    const when = evt.dateStart ? safeFormat(evt.dateStart) : "";
    const msg = `Hi, saya ${name} dah RSVP untuk "${evt.title}" ${when ? "(" + when + ")" : ""} di ${evt.venueName}.`;
    return `https://wa.me/${to}?text=${encodeURIComponent(msg)}`;
  }, [evt?.waPhone, evt?.title, evt?.venueName, evt?.dateStart, name]);

  useEffect(() => {
    if (!slug) {
      setError("Parameter ?event= tiada.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/events/${slug}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Event tidak dijumpai.");
        const data: EventDTO = await res.json();
        setEvt(data.event);
      } catch (e: any) {
        setError(e.message || "Error catching event.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // 👇 bila submit berjaya & ada waPhone → mulakan countdown dan redirect
  useEffect(() => {
    if (!done || !waUrl) return;
    setTimer(5); // reset setiap kali show success
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(id);
          window.location.href = waUrl;
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [done, waUrl]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!evt) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: evt.slug,
          name,
          email,
          phone,
          company,
          notes,
        }),
      });

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Invalid response (${res.status}). ${text.slice(0, 120)}`);
      }

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      setDone({ id: data.rsvpId });
    } catch (err: any) {
      setError(err.message || "Failed to send RSVP.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="mx-auto max-w-xl px-4 py-14">Loading…</main>;
  if (!evt) return <main className="mx-auto max-w-xl px-4 py-14">Event not found.</main>;

  if (done) {
    const hasWa = Boolean(waUrl);
    return (
      <main className="mx-auto max-w-xl px-4 py-14">
        <h1 className="text-2xl font-semibold">RSVP Accepted 🎉</h1>
        <p className="mt-2 text-gray-600">
          Thank You! Your reservation for <b>{evt.title}</b> has been recorded.
        </p>
        <p className="mt-2 text-gray-600">
          Reference Code: <span className="font-mono font-semibold">{done.id}</span>
        </p>

        {hasWa ? (
          <div className="mt-6 rounded-lg border p-4 bg-green-50 text-green-800">
            <p className="text-sm">
            You will be taken to WhatsApp for verification purposes in{" "}
              <span className="font-semibold">{timer}s</span>…
            </p>
            <a
              href={waUrl}
              className="mt-3 inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Open WhatsApp Now
            </a>
          </div>
        ) : (
          <></>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      {evt.coverImage && (
        <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-gray-200">
          <Image
            src={coverHero(evt.coverImage)}
            alt={evt.title}
            fill
            priority={false}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <h1 className="text-2xl font-bold">{evt.title}</h1>
      <p className="mt-1 text-gray-600">
        {evt.venueName} ({evt.venueCode})
      </p>
      <p className="mt-1 text-gray-600">{safeFormat(evt.dateStart)}</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            name="name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-md border px-3 py-2 ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone Number</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            name="phone"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Company</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea
            className="mt-1 w-full rounded-md border px-3 py-2 ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <button
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send Reservation"}
        </button>
      </form>
    </main>
  );
}
