import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await prisma.event.findMany({
    where: { isPublished: true, dateStart: { gte: new Date() } },
    orderBy: { dateStart: "asc" },
    select: {
      id: true,
      title: true,
      venueName: true,
      venueCode: true,
      dateStart: true,
      slug: true,
      coverImage: true,
    },
  });

  return NextResponse.json({ events });
}