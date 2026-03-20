"use client";
import { Radar, IconContainer } from "@/components/ui/radar-effect";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { HiCode, HiChip, HiAcademicCap, HiLightBulb, HiCalculator } from "react-icons/hi";

const defaultIcons = [
  <HiCode className="h-8 w-8 text-slate-400" />,
  <HiChip className="h-8 w-8 text-slate-400" />,
  <HiAcademicCap className="h-8 w-8 text-slate-400" />,
  <HiLightBulb className="h-8 w-8 text-slate-400" />,
  <HiCalculator className="h-8 w-8 text-slate-400" />,
];

interface Subject {
  slug: string;
  title: string;
  description: string;
}

export default function Home() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await fetch("/api/subjects");
        const data = await res.json();
        setSubjects(data);
      } catch {
        setSubjects([]);
      }
      setLoading(false);
    };
    loadSubjects();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black">
      <div className="relative flex h-[500px] w-full max-w-3xl flex-col items-center justify-center space-y-4 overflow-hidden px-4">
        <h1 className="text-2xl font-bold text-slate-400 mb-8">Select a Subject</h1>
        
        {subjects.length > 0 && (
          <>
            <div className="mx-auto w-full max-w-3xl">
              <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0">
                {subjects[0] && (
                  <IconContainer
                    text={subjects[0].title}
                    delay={0.2}
                    icon={defaultIcons[0]}
                    onClick={() => router.push(`/subjects/${subjects[0].slug}`)}
                  />
                )}
                {subjects[1] && (
                  <IconContainer
                    text={subjects[1].title}
                    delay={0.4}
                    icon={defaultIcons[1]}
                    onClick={() => router.push(`/subjects/${subjects[1].slug}`)}
                  />
                )}
              </div>
            </div>
            
            {subjects[2] && (
              <div className="mx-auto w-full max-w-md">
                <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0">
                  <IconContainer
                    text={subjects[2].title}
                    delay={0.5}
                    icon={defaultIcons[2]}
                    onClick={() => router.push(`/subjects/${subjects[2].slug}`)}
                  />
                </div>
              </div>
            )}
            
            <div className="mx-auto w-full max-w-3xl">
              <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0">
                {subjects[3] && (
                  <IconContainer
                    text={subjects[3].title}
                    delay={0.6}
                    icon={defaultIcons[3]}
                    onClick={() => router.push(`/subjects/${subjects[3].slug}`)}
                  />
                )}
                {subjects[4] && (
                  <IconContainer
                    text={subjects[4].title}
                    delay={0.8}
                    icon={defaultIcons[4]}
                    onClick={() => router.push(`/subjects/${subjects[4].slug}`)}
                  />
                )}
              </div>
            </div>
          </>
        )}

        <Radar className="absolute -bottom-12" />
        <div className="absolute bottom-0 z-[41] h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      </div>

      <Link
        href="/admin"
        className="absolute bottom-4 right-4 text-xs text-slate-600 hover:text-slate-400 transition-colors"
      >
        Admin
      </Link>
    </div>
  );
}
