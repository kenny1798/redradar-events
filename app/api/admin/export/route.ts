import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const eventId = url.searchParams.get("eventId") || "";
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const rows = await prisma.rsvp.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
    select: { fullName:true, phone:true, email:true, company:true, notes:true, status:true, createdAt:true },
  });

  const headers = Object.keys(rows[0] ?? { fullName:"", phone:"", email:"", company:"", notes:"", status:"", createdAt:"" });
  const escape = (v: any) => `"${String(v ?? "").replace(/"/g,'""')}"`;
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map(h => escape((r as any)[h])).join(","));
  const csv = lines.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rsvps_${eventId}.csv"`,
    },
  });
}
