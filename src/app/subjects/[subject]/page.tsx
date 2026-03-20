"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CategoryList, Category } from '@/components/ui/category-list';
import { BookOpen, ArrowLeft, Loader2 } from 'lucide-react';

interface Subject {
  slug: string;
  title: string;
  description: string;
}

const examCategories: Category[] = [
  {
    id: 'prelim',
    title: 'Prelim',
    subtitle: 'First semester examinations',
    icon: <BookOpen className="w-8 h-8 text-slate-400" />,
  },
  {
    id: 'midterm',
    title: 'Midterm',
    subtitle: 'Second phase examinations',
    icon: <BookOpen className="w-8 h-8 text-slate-400" />,
  },
  {
    id: 'semifinal',
    title: 'Semifinal',
    subtitle: 'Third phase examinations',
    icon: <BookOpen className="w-8 h-8 text-slate-400" />,
  },
  {
    id: 'finals',
    title: 'Finals',
    subtitle: 'Final semester examinations',
    icon: <BookOpen className="w-8 h-8 text-slate-400" />,
  },
];

export default function SubjectPage() {
  const params = useParams();
  const router = useRouter();
  const subjectSlug = params.subject as string;
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubject = async () => {
      try {
        const res = await fetch("/api/subjects");
        const subjects = await res.json();
        const found = subjects.find((s: Subject) => s.slug === subjectSlug);
        setSubject(found || null);
      } catch {
        setSubject(null);
      }
      setLoading(false);
    };
    loadSubject();
  }, [subjectSlug]);

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/subjects/${subjectSlug}/${categoryId}`);
  };

  const categories: Category[] = examCategories.map(cat => ({
    ...cat,
    onClick: () => handleCategoryClick(String(cat.id)),
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-slate-200">Subject not found</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto p-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-4 py-2 mb-6 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Subjects
        </button>
      </div>
      
      <CategoryList
        title={subject.title}
        subtitle={subject.description}
        categories={categories}
        headerIcon={<BookOpen className="w-8 h-8" />}
      />
    </div>
  );
}
