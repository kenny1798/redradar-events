// app/api/rsvp/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isEmail(v?: string) {
  if (!v) return true; // email optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, name, phone, email, company, notes } = body || {};

    // basic validate
    if (!slug || !name || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // get event
    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event || !event.isPublished) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // capacity guard (kalau guna capacity)
    if (event.capacity && event.capacity > 0) {
      const current = await prisma.rsvp.count({ where: { eventId: event.id } });
      if (current >= event.capacity) {
        return NextResponse.json({ error: "Event is fully booked" }, { status: 409 });
      }
    }

    // elak duplicate (unique eventId+email)
    if (email) {
      const exists = await prisma.rsvp.findFirst({
        where: { eventId: event.id, email: email.toLowerCase() },
        select: { id: true },
      });
      if (exists) {
        return NextResponse.json({ error: "This email has RSVP'd for this event" }, { status: 409 });
      }
    }

    // create rsvp – TIADA code
    const r = await prisma.rsvp.create({
      data: {
        eventId: event.id,
        fullName: name,
        phone,
        email: email ? email.toLowerCase() : null,
        company: company || null,
        notes: notes || null,
        status: "WAITLIST",
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, rsvpId: r.id, createdAt: r.createdAt });
  } catch (e: any) {
    console.error("POST /api/rsvp error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
