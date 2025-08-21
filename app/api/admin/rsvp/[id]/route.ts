import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();
    if (!status) {
      return NextResponse.json(
        { ok: false, error: "Missing status" },
        { status: 400 }
      );
    }

    const rsvp = await prisma.rsvp.update({
      where: { id: params.id },
      data: { status }, // adjust if your enum uses uppercase
      select: { id: true, status: true },
    });

    return NextResponse.json({ ok: true, rsvp });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Update failed" },
      { status: 400 }
    );
  }
}
