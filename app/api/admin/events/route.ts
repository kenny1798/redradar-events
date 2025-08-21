import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function authed(req: NextRequest) {
  return req.cookies.get("admin")?.value === "ok";
}

const slugify = (s: string) =>
  s.toLowerCase()
   .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
   .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export async function GET() {
  const events = await prisma.event.findMany({ orderBy: { dateStart: "desc" }});
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    title,
    description,
    venueName,
    venueCode,       // 'NORTH' | 'CENTRAL' | 'SOUTH'
    address,
    mapUrl,
    dateStart,       // string/Date
    dateEnd,         // optional
    coverImage,
    capacity,        // optional number
    isPublished,     // boolean
    slug,            // optional
  } = body || {};

  if (!title || !venueName || !venueCode || !dateStart) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const ds = new Date(dateStart);
  const de = dateEnd ? new Date(dateEnd) : null;

  const finalSlug = (slug && slug.length ? slugify(slug) : slugify(title));
  try {
    const created = await prisma.event.create({
      data: {
        title,
        description,
        venueName,
        venueCode,
        address,
        mapUrl,
        dateStart: ds,
        dateEnd: de ?? undefined,
        coverImage,
        capacity: capacity ? Number(capacity) : undefined,
        isPublished: !!isPublished,
        slug: finalSlug,
      },
    });
    return NextResponse.json({ ok: true, event: created });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
