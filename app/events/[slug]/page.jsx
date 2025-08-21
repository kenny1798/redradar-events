import Image from "next/image";
import { coverHero } from "@/lib/cloudinary";
import { headers } from "next/headers";
import { safeFormat } from "@/utils/date";
import DOMPurify from "isomorphic-dompurify";

async function getEvent(slug) {
  const h = headers();
  const host = h.get("host");
  const proto = process.env.NODE_ENV === "development" ? "http" : "https";
  const res = await fetch(`${proto}://${host}/api/events/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json(); // -> { event: {...} }
}

export default async function EventDetail({ params }) {
  const data = await getEvent(params.slug);
  if (!data || !data.event) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-14 text-red-600">
        Event not found.
      </main>
    );
  }

  const e = data.event; // <-- senang pakai

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* hero */}
      {e.coverImage && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-gray-200">
          <Image
            src={coverHero(e.coverImage)}
            alt={e.title}
            fill
            priority={false}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* header */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,360px]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{e.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-700">
            {e.dateStart && (
              <span className="rounded-full bg-gray-100 px-3 py-1">
                {safeFormat(e.dateStart)}
              </span>
            )}
            {e.dateEnd && (
              <span className="rounded-full bg-gray-100 px-3 py-1">
                → {safeFormat(e.dateEnd)}
              </span>
            )}
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 ring-1 ring-inset ring-indigo-100">
              {e.venueName} ({e.venueCode})
            </span>
          </div>

          {/* description */}
          {e.description && (
            <div className="prose prose-indigo mt-6 max-w-none">
              <div
                className="content-html max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(e.description || "", {
                    USE_PROFILES: { html: true },
                  }),
                }}
              />
            </div>
          )}

          {/* address + map */}
          <div className="mt-6 space-y-2 text-sm text-gray-700">
            {e.address && <div>📍 {e.address}</div>}
            {e.mapUrl && (
              <a href={e.mapUrl} target="_blank" className="text-indigo-600 underline">
                Open in Google Maps →
              </a>
            )}
          </div>
        </div>

        {/* sticky RSVP card */}
        <aside className="lg:sticky lg:top-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <div className="text-sm text-gray-600">Seats available</div>
            <div className="mt-1 text-2xl font-semibold">
              {typeof e.capacity === "number" && e.capacity > 0 ? e.capacity : "Unlimited"}
            </div>

            <a
              href={`/rsvp?event=${encodeURIComponent(e.slug)}`}
              className="mt-5 block w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              RSVP Now
            </a>

            <div className="mt-4 text-xs text-gray-500">
              * Seats are limited. RSVP now to secure your spot.
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
