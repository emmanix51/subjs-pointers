import { readFile, writeFile } from "fs/promises";
import path from "path";

export interface Subject {
  slug: string;
  title: string;
  description: string;
}

export interface SubjectsData {
  subjects: Subject[];
}

const dataPath = path.join(process.cwd(), "data", "subjects.json");

export async function getSubjects(): Promise<Subject[]> {
  try {
    const data = await readFile(dataPath, "utf-8");
    const parsed: SubjectsData = JSON.parse(data);
    return parsed.subjects;
  } catch {
    return [];
  }
}

export async function saveSubjects(subjects: Subject[]): Promise<void> {
  await writeFile(dataPath, JSON.stringify({ subjects }, null, 2), "utf-8");
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
