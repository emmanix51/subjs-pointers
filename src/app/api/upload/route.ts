import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get("admin_auth");

  if (!isAuth || isAuth.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const subject = formData.get("subject") as string;
    const term = formData.get("term") as string;
    const type = formData.get("type") as string;
    const originalFileName = formData.get("fileName") as string;

    if (!file || !subject || !term || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", subject, term, type);
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const ext = file.name.split(".").pop() || "";
    let safeFileName = (originalFileName || file.name)
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "-")
      .replace(/-+/g, "-");
    
    // For PDFs, use original name without timestamp
    // For images, keep unique suffix in case of duplicates
    let finalFileName = safeFileName;
    if (type === "pictures") {
      const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      finalFileName = `${uniqueSuffix}-${safeFileName}`;
    }
    
    const filePath = path.join(uploadDir, finalFileName);

    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${subject}/${term}/${type}/${finalFileName}`,
      fileName: originalFileName || file.name
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get("admin_auth");

  if (!isAuth || isAuth.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { filePath } = await request.json();
    const fullPath = path.join(process.cwd(), "public", filePath);
    
    const { unlink } = await import("fs/promises");
    await unlink(fullPath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
