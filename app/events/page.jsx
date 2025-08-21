import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { coverCard } from "@/lib/cloudinary";

async function getEvents() {
  const h = headers();
  const host = h.get("host");
  const proto = process.env.NODE_ENV === "development" ? "http" : "https";
  const res = await fetch(`${proto}://${host}/api/events`, { cache: "no-store" });
  if (!res.ok) return { events: [] };
  return res.json();
}

export default async function EventsPage({ searchParams }) {
  const { events } = await getEvents();

  // simple clientless filter (URL params: ?q=&venue=)
  const q = (searchParams?.q || "").toLowerCase();
  const venue = (searchParams?.venue || "").toUpperCase();
  const filtered = events.filter((e) => {
    const hitQ = !q || `${e.title} ${e.venueName}`.toLowerCase().includes(q);
    const hitV = !venue || e.venueCode === venue;
    return hitQ && hitV;
  });

  const venues = ["CENTRAL", "NORTH", "SOUTH"]; // ikut enum kau

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Upcoming Open Day</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select event and venue to see details.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form className="w-full sm:w-auto">
          <input
            name="q"
            defaultValue={q}
            placeholder="Find Title / Venue ..."
            className="w-full sm:w-80 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/events"
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition
              ${!venue ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            All
          </Link>
          {venues.map((v) => (
            <Link
              key={v}
              href={`/events?venue=${v}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition
                ${venue === v ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              {v}
            </Link>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {!filtered.length && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gradient-to-b from-white to-gray-50 p-12 text-center text-gray-600">
          Tiada event ditemui.
        </div>
      )}

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => (
          <Link
            key={e.id}
            href={`/events/${e.slug}`}
            className="group overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 transition-shadow hover:shadow-xl"
          >
            <div className="relative aspect-[16/9]">
              {e.coverImage ? (
                <Image
                  src={coverCard(e.coverImage)}  // Cloudinary: f_auto,q_auto,c_fill,w_800,h_450
                  alt={e.title}
                  fill
                  sizes="(max-width:1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <></>
              )}
              <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-black/5">
                {e.venueName} <span className="text-gray-400">({e.venueCode})</span>
              </div>
            </div>

            <div className="space-y-2 p-4">
              <h3 className="line-clamp-2 text-lg font-semibold">{e.title}</h3>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
                  <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                        d="M8 7V3m8 4V3M4 11h16M6 21h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/>
                </svg>
                {new Date(e.dateStart).toLocaleString()}
              </div>

              <div>
                <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-100">
                  RSVP Now →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
