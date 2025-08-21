import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// UPDATE (PUT)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const updated = await prisma.event.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        venueCode: body.venueCode,
        venueName: body.venueName,
        address: body.address,
        mapUrl: body.mapUrl,
        waPhone: body.waPhone,
        dateStart: body.dateStart ? new Date(body.dateStart) : undefined,
        dateEnd: body.dateEnd ? new Date(body.dateEnd) : null,
        coverImage: body.coverImage,
        capacity: body.capacity ?? null,
        isPublished: Boolean(body.isPublished),
        slug: body.slug || null,
      },
    });

    return NextResponse.json({ ok: true, event: updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Update failed" }, { status: 400 });
  }
}

// DELETE
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.rsvp.deleteMany({ where: { eventId: params.id } }); // optional: cascade
    await prisma.event.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Delete failed" }, { status: 400 });
  }
}
