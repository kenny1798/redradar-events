// app/api/_utils/admin.ts
import { NextRequest } from "next/server";
export const isAuthed = (req: NextRequest) => req.cookies.get("admin")?.value === "ok";
export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
   .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
