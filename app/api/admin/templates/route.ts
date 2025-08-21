// app/api/admin/templates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthed } from "@/app/api/_utils/admin";

export async function GET() {
  const templates = await prisma.eventTemplate.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, title, description, venueName, venueCode, address, mapUrl, waPhone, coverImage, capacity } = body || {};
  if (!name || !title || !venueName || !venueCode)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const created = await prisma.eventTemplate.create({
    data: { name, title, description, venueName, venueCode, address, mapUrl, waPhone, coverImage, capacity: capacity ? Number(capacity) : null },
  });
  return NextResponse.json({ ok: true, template: created });
}
