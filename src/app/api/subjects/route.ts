import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSubjects, saveSubjects, generateSlug, Subject } from "@/lib/subjects";

export const dynamic = "force-dynamic";

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
