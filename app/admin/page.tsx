import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CopyEventLinkButton from "@/components/CopyEventLinkButton";

type EventRow = {
  id: number;
  title: string;
  dateStart: Date | null;
  venueName: string | null;
  slug: string;
  isPublished: boolean;
};

export default async function AdminHome() {
  const events: EventRow[] = await prisma.event.findMany({
    orderBy: { dateStart: "desc" },
    select: {
      id: true,
      title: true,
      dateStart: true,
      venueName: true,
      slug: true,
      isPublished: true,
    },
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 lg:px-6">
      {/* Page header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-wide">
          Admin <span className="opacity-60">•</span> Events
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/templates"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            Templates
          </Link>

          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-cyan-400"
          >
            Create Event
          </Link>

          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate/10 bg-white/5">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900/70 text-left text-xs uppercase tracking-wide ">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Venue</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">RSVP</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/events/${e.id}`}
                    className="font-medium  hover:underline"
                  >
                    {e.title}
                  </Link>
                </td>

                <td className="px-4 py-3 ">
                  {e.dateStart ? e.dateStart.toLocaleString() : (
                    <span className="italic ">—</span>
                  )}
                </td>

                <td className="px-4 py-3 ">
                  {e.venueName ?? <span className="italic ">—</span>}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
                      e.isPublished
                        ? "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-400/30"
                        : "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30",
                    ].join(" ")}
                  >
                    {e.isPublished ? "Published" : "Draft"}
                  </span>
                </td>

                <td className="px-4 py-3 text-right flex gap-2 justify-end">
                  <Link
                    href={`/admin/events/${e.id}`}
                    className="rounded-md border border-gray-500/40 bg-gray-500/20 px-3 py-1.5 text-xs hover:bg-gray-500/10"
                  >
                    View Participants
                  </Link>

                  <Link
                    href={`/admin/events/${e.id}/edit`}
                    className="rounded-md border border-cyan-500/40 bg-cyan-500/20 px-3 py-1.5 text-xs text-cyan-600 hover:bg-cyan-500/30"
                  >
                    Edit
                  </Link>

                  <CopyEventLinkButton slug={e.slug} id={e.id} serverUrl={process.env.SERVER_URL}/>
                </td>

              </tr>
            ))}

            {events.length === 0 && (
              <tr>
                <td className="px-4 py-10 text-center " colSpan={5}>
                  <div className="mx-auto w-full max-w-sm">
                    <div className="mb-2 text-base font-medium ">
                      No events yet
                    </div>
                    <div className="mb-4 text-sm">
                      Get started by creating your first event.
                    </div>
                    <Link
                      href="/admin/events/new"
                      className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-cyan-400"
                    >
                      Create Event
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
