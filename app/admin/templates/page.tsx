import Link from "next/link";
import { prisma } from "@/lib/prisma";

type TemplateRow = {
  id: string;
  name: string;
  venueName: string | null;
  venueCode: string | null;
  updatedAt: Date;
};

export default async function TemplatesPage() {
  const templates: TemplateRow[] = await prisma.eventTemplate.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      venueName: true,
      venueCode: true,
      updatedAt: true,
    },
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 lg:px-6">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-wide">
          Admin <span className="opacity-60">•</span> Templates
        </h1>

        <div>
        <Link
          href="/admin"
          className="inline-flex items-center mx-2 gap-2 rounded-lg px-3 py-2 text-sm text-slate-900"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/templates/new"
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-cyan-400"
        >
          New Template
        </Link>
        </div>

      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate/10 bg-white/5">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-900/70 text-left text-xs uppercase tracking-wide ">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Venue</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {templates.map((t) => (
              <tr key={t.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/templates/${t.id}`}
                    className="font-medium text-slate-400 hover:underline"
                  >
                    {t.name}
                  </Link>
                </td>

                <td className="px-4 py-3 ">
                  {t.venueName ? (
                    <>
                      {t.venueName}{" "}
                      <span className="">
                        ({t.venueCode ?? "—"})
                      </span>
                    </>
                  ) : (
                    <span className="italic ">—</span>
                  )}
                </td>

                <td className="px-4 py-3 ">
                  {t.updatedAt.toLocaleString()}
                </td>

                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/templates/${t.id}/use`}
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                  >
                    Create from template
                  </Link>
                </td>
              </tr>
            ))}

            {templates.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center ">
                  <div className="mx-auto w-full max-w-sm">
                    <div className="mb-2 text-base font-medium ">
                      No templates yet
                    </div>
                    <div className="mb-4 text-sm">
                      Start by creating your first template.
                    </div>
                    <Link
                      href="/admin/templates/new"
                      className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-cyan-400"
                    >
                      New Template
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
