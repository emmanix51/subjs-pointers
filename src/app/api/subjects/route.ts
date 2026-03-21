import { readFile, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export interface Subject {
  slug: string;
  title: string;
  description: string;
}

export interface SubjectsData {
  subjects: Subject[];
}

const dataPath = path.join(process.cwd(), "data", "subjects.json");

async function getSubjects(): Promise<Subject[]> {
  try {
    const data = await readFile(dataPath, "utf-8");
    const parsed: SubjectsData = JSON.parse(data);
    return parsed.subjects;
  } catch {
    return [];
  }
}

async function saveSubjects(subjects: Subject[]): Promise<void> {
  await writeFile(dataPath, JSON.stringify({ subjects }, null, 2), "utf-8");
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const subjects = await getSubjects();
  return NextResponse.json(subjects);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get("admin_auth");

  if (!isAuth || isAuth.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description required" }, { status: 400 });
    }

    const subjects = await getSubjects();
    const slug = generateSlug(title);

    if (subjects.find((s) => s.slug === slug)) {
      return NextResponse.json({ error: "Subject with this title already exists" }, { status: 400 });
    }

    const newSubject: Subject = { slug, title, description };
    subjects.push(newSubject);
    await saveSubjects(subjects);

    return NextResponse.json(newSubject);
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get("admin_auth");

  if (!isAuth || isAuth.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug, title, description } = await request.json();

    if (!slug || !title || description === undefined) {
      return NextResponse.json({ error: "Slug, title, and description required" }, { status: 400 });
    }

    const subjects = await getSubjects();
    const index = subjects.findIndex((s) => s.slug === slug);

    if (index === -1) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    subjects[index] = { slug, title, description };
    await saveSubjects(subjects);

    return NextResponse.json(subjects[index]);
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json({ error: "Failed to update subject" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get("admin_auth");

  if (!isAuth || isAuth.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug required" }, { status: 400 });
    }

    const subjects = await getSubjects();
    const filtered = subjects.filter((s) => s.slug !== slug);

    if (filtered.length === subjects.length) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    await saveSubjects(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json({ error: "Failed to delete subject" }, { status: 500 });
  }
}
