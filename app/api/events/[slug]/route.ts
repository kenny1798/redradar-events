import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
  });

  if (!event || !event.isPublished) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ event });
}
