import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get("subject");
  const term = searchParams.get("term");
  const type = searchParams.get("type");

  if (!subject || !term || !type) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const dir = path.join(process.cwd(), "public", "uploads", subject, term, type);
    const files = await readdir(dir);
    const urls = files.map((file) => `/uploads/${subject}/${term}/${type}/${file}`);
    return NextResponse.json(urls);
  } catch {
    return NextResponse.json([]);
  }
}
