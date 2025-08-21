import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAuthed(req: NextRequest) {
  return req.cookies.get("admin")?.value === "ok";
}
const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
   .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = await prisma.eventTemplate.findUnique({ where: { id: params.id } });
  if (!t) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { dateStart, dateEnd, slug, isPublished = true, overrides = {} } = body;
  if (!dateStart) return NextResponse.json({ error: "dateStart required" }, { status: 400 });

  const title = overrides.title ?? t.title;
  const created = await prisma.event.create({
    data: {
      title,
      description: overrides.description ?? t.description,
      venueName: overrides.venueName ?? t.venueName,
      venueCode: overrides.venueCode ?? t.venueCode,
      address: overrides.address ?? t.address,
      mapUrl: overrides.mapUrl ?? t.mapUrl,
      waPhone: overrides.waPhone ?? t.waPhone,
      coverImage: overrides.coverImage ?? t.coverImage,
      capacity: (overrides.capacity ?? t.capacity) ?? undefined,
      dateStart: new Date(dateStart),
      dateEnd: dateEnd ? new Date(dateEnd) : undefined,
      isPublished: !!isPublished,
      slug: slug?.length ? slugify(slug) : slugify(`${title}-${new Date(dateStart).toISOString().slice(0,10)}`),
    },
  });

  return NextResponse.json({ ok: true, event: created });
}
