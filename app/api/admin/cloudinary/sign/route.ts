import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function isAuthed(req: NextRequest) {
  return req.cookies.get("admin")?.value === "ok";
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { folder } = await req.json().catch(() => ({}));
  const usedFolder = folder || process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads";
  const timestamp = Math.round(Date.now() / 1000);

  const toSign = `folder=${usedFolder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex");

  return NextResponse.json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder: usedFolder,
  });
}
