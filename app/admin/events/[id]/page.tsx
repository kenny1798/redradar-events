import { prisma } from "@/lib/prisma";
import Link from "next/link";
import WaitlistButtons from "@/components/WaitlistButtons";

function toCSV(rows: any[]) {
  if (!rows.length)
    return "fullName,phone,email,company,notes,status,createdAt\n";
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map((h) => escape(r[h])).join(","));
  return lines.join("\n");
}

export default async function RSVPsByEvent({
  params,
}: {
  params: { id: string };
}) {
  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event)
    return (
      <main className="p-6">
        <p>Event not found</p>
      </main>
    );

  const rsvps = await prisma.rsvp.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      company: true,
      notes: true,
      status: true,
      createdAt: true,
    },
  });

  // CSV
  const csv = toCSV(rsvps);
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  const filename = `rsvps_${event.slug || event.id}.csv`;

  // ---- Status counts (case-insensitive) ----
  const counts = rsvps.reduce(
    (acc, r) => {
      const s = String(r.status ?? "").toUpperCase();
      if (s === "CONFIRMED") acc.confirmed += 1;
      else if (s === "WAITLIST" || s === "WAITLISTED") acc.waitlist += 1;
      else if (s === "CANCELLED" || s === "CANCELED") acc.cancelled += 1;
      return acc;
    },
    { confirmed: 0, waitlist: 0, cancelled: 0 }
  );
  const total = rsvps.length;

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <Link
        href="/admin"
        className="text-sm text-cyan-600 hover:underline inline-block"
      >
        ← Back
      </Link>

      <h2 className="mt-2 text-xl font-semibold">{event.title}</h2>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
        <div>
          <b>When:</b>{" "}
          {event.dateStart ? new Date(event.dateStart).toLocaleString() : "—"}
        </div>
        <div>
          <b>Venue:</b> {event.venueName || "—"}
        </div>
      </div>

      {/* ---- Status cards ---- */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400">Confirmed</span>
          </div>
          <div className="mt-2 text-3xl font-semibold text-emerald-500">
            {counts.confirmed}
          </div>
          <div className="mt-1 text-xs text-slate-500">of {total} RSVPs</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400" />
            <span className="text-slate-400">Waitlist</span>
          </div>
          <div className="mt-2 text-3xl font-semibold text-slate-500">
            {counts.waitlist}
          </div>
          <div className="mt-1 text-xs text-slate-500">of {total} RSVPs</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="text-rose-400">Cancelled</span>
          </div>
          <div className="mt-2 text-3xl font-semibold text-rose-500">
            {counts.cancelled}
          </div>
          <div className="mt-1 text-xs text-slate-500">of {total} RSVPs</div>
        </div>
      </div>

      <div className="mt-4">
        <a href={csvHref} download={filename}>
          <button className="rounded-lg bg-cyan-500/90 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-cyan-400">
            Export CSV
          </button>
        </a>
      </div>

      {/* ---- Table ---- */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-300 bg-white/5">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900/70 text-left text-xs uppercase tracking-wide">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {rsvps.map((r, k) => {
              const num = k + 1;
              let statColor = 'gray'
              if(r.status === "CANCELLED"){
                statColor = 'rose'
              }else if(r.status === "CONFIRMED"){
                statColor = 'emerald'
              }
              return (
                <tr key={r.id} className="hover:bg-white/5">
                  <td className="px-4 py-2">{num}</td>
                  <td className="px-4 py-2">{r.fullName}</td>
                  <td className="px-4 py-2">{r.phone}</td>
                  <td className="px-4 py-2">{r.email}</td>
                  <td className="px-4 py-2">{r.company}</td>
                  <td className="px-4 py-2">{r.notes}</td>
                  <td className={`px-4 py-2 text-${statColor}-500`}>{r.status}</td>
                  <td className="px-4 py-2">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <WaitlistButtons id={r.id} status={r.status} />
                  </td>
                </tr>
              );
            })}

            {rsvps.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center">
                  No RSVPs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
