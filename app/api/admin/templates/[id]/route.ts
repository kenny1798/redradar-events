// app/api/admin/templates/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthed } from "@/app/api/_utils/admin";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const t = await prisma.eventTemplate.findUnique({ where: { id: params.id } });
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ template: t });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const updated = await prisma.eventTemplate.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ ok: true, template: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.eventTemplate.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
