"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Image, FileText, X, Loader2 } from 'lucide-react';
import { PictureGallery } from '@/components/ui/picture-gallery';
import { Component as PdfViewer } from '@/components/ui/pdf-viewer';

type Tab = 'pictures' | 'pdfs';

export default function TermPage() {
  const params = useParams();
  const router = useRouter();
  const subjectSlug = params.subject as string;
  const termSlug = params.term as string;
  const [activeTab, setActiveTab] = useState<Tab>('pictures');
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [images, setImages] = useState<{ url: string; alt?: string }[]>([]);
  const [pdfs, setPdfs] = useState<{ url: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const termTitle = termSlug.charAt(0).toUpperCase() + termSlug.slice(1);

  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true);
      try {
        const [picsRes, pdfsRes] = await Promise.all([
          fetch(`/api/files?subject=${subjectSlug}&term=${termSlug}&type=pictures`),
          fetch(`/api/files?subject=${subjectSlug}&term=${termSlug}&type=pdfs`),
        ]);

        const pics = await picsRes.json();
        const pdfFiles = await pdfsRes.json();

        setImages(pics.map((url: string) => ({ url, alt: url.split("/").pop() })));
        setPdfs(pdfFiles.map((url: string) => ({ 
          url, 
          name: url.split("/").pop() || "Document.pdf" 
        })));
      } catch {
        setImages([]);
        setPdfs([]);
      }
      setLoading(false);
    };

    loadFiles();
  }, [subjectSlug, termSlug]);

  if (selectedPdf) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <button
          onClick={() => setSelectedPdf(null)}
          className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
          Close
        </button>
        <PdfViewer url={selectedPdf} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto p-4">
        <button
          onClick={() => router.push(`/subjects/${subjectSlug}`)}
          className="flex items-center gap-2 px-4 py-2 mb-6 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {termTitle}
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-200 mb-2">{termTitle}</h1>
          <p className="text-slate-500">Select pictures or PDFs to view</p>
        </div>

        <div className="flex gap-4 mb-6 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('pictures')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'pictures'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Image className="w-5 h-5" />
            Pictures ({images.length})
          </button>
          <button
            onClick={() => setActiveTab('pdfs')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'pdfs'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-5 h-5" />
            PDFs ({pdfs.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'pictures' && (
              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-800">
                {images.length > 0 ? (
                  <PictureGallery images={images} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                    <Image className="w-12 h-12 mb-4 opacity-50" />
                    <p>No pictures available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pdfs' && (
              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-800">
                {pdfs.length > 0 ? (
                  <div className="space-y-3">
                    {pdfs.map((pdf, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPdf(pdf.url)}
                        className="flex items-center gap-3 p-4 rounded-lg border border-slate-700 hover:border-sky-500 bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
                      >
                        <FileText className="w-8 h-8 text-sky-400 flex-shrink-0" />
                        <span className="text-slate-300 hover:text-slate-100">{pdf.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                    <FileText className="w-12 h-12 mb-4 opacity-50" />
                    <p>No PDFs available</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
