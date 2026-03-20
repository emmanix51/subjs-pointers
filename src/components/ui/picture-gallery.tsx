"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PictureGalleryProps {
  images: { url: string; alt?: string }[];
  className?: string;
}

export function PictureGallery({ images, className }: PictureGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64 text-slate-500", className)}>
        No pictures available
      </div>
    );
  }

  return (
    <>
      <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className="relative aspect-square overflow-hidden rounded-lg border border-slate-700 hover:border-sky-500 transition-colors group cursor-pointer bg-slate-900"
          >
            <img
              src={image.url}
              alt={image.alt || `Image ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
            }}
            className="absolute left-4 p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
            }}
            className="absolute right-4 p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <img
            src={images[selectedIndex].url}
            alt={images[selectedIndex].alt || `Image ${selectedIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 text-slate-400 text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
