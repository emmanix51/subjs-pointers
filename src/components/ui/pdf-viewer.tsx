"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/blocks/sidebar";
import { cn } from "@/lib/utils";
import {
  CircleMinus,
  CirclePlus,
  Loader2,
  RotateCcw,
  RotateCw,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs, Thumbnail } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

const ZOOM_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4, 8];

function highlightPattern(text: string, pattern: string, itemIndex: number) {
  return text.replace(
    pattern,
    (value: string) => `<mark id="search-result-${itemIndex}">${value}</mark>`
  );
}

function Component({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const textRenderer = useCallback(
    (textItem: { str: string; itemIndex: number }) =>
      highlightPattern(textItem.str, searchQuery, textItem.itemIndex),
    [searchQuery]
  );

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  useEffect(() => {
    if (!viewportRef.current) return;

    const options = {
      root: viewportRef.current,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const pageElement = entry.target.closest("[data-page-number]");
          if (pageElement) {
            const pageNumber = parseInt(
              pageElement.getAttribute("data-page-number") || "1",
              10
            );
            setCurrentPage(pageNumber);
          }
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);

    const mutationObserver = new MutationObserver(() => {
      const pages = viewportRef.current?.querySelectorAll(".react-pdf__Page");
      if (pages) {
        pages.forEach((page) => {
          observer.observe(page);
        });
      }
    });

    mutationObserver.observe(viewportRef.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [numPages]);

  return (
    <SidebarProvider>
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        className={"w-full flex flex-row bg-slate-950"}
        loading={
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Loader2 className="size-4 animate-spin" />
          </div>
        }
      >
        <Sidebar>
          <SidebarRail />
          <SidebarContent className="flex flex-col p-4 items-center bg-slate-900 overflow-y-auto">
            {Array.from(new Array(numPages), (el, index) => (
              <div
                className={cn(
                  "flex flex-col gap-2 mb-4 w-36 hover:bg-slate-800 transition p-2 cursor-pointer rounded-lg",
                  index + 1 === currentPage && "bg-slate-800 border border-sky-500"
                )}
                key={`thumbnail_${index + 1}`}
                onClick={() => {
                  const pageElement = document.querySelector(`[data-page-number="${index + 1}"]`);
                  pageElement?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Thumbnail
                  pageNumber={index + 1}
                  className="border border-slate-700 shadow-xs"
                  width={120}
                  height={80}
                  rotate={rotation}
                />
                <div className="flex flex-row justify-center">
                  <span className="text-sm text-slate-500">{index + 1}</span>
                </div>
              </div>
            ))}
          </SidebarContent>
        </Sidebar>
        <div className="flex-row w-full">
          <div className="w-full h-full flex flex-col grow">
            <div className="flex p-2 border-b border-slate-800 justify-between bg-slate-900">
              <div className="flex flex-row gap-2 items-center">
                <SidebarTrigger />
                <div className="text-sm text-slate-400">
                  Page {currentPage} of {numPages}
                </div>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <button
                  onClick={() => setRotation(rotation - 90)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="size-4" />
                </button>
                <button
                  onClick={() => setRotation(rotation + 90)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <RotateCw className="size-4" />
                </button>
                <Separator orientation="vertical" className="bg-slate-700 h-4" />
                <button
                  disabled={zoom <= ZOOM_OPTIONS[0]}
                  onClick={() => setZoom(zoom - 0.25)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  <CircleMinus className="size-4" />
                </button>
                <button
                  disabled={zoom >= ZOOM_OPTIONS[ZOOM_OPTIONS.length - 1]}
                  onClick={() => setZoom(zoom + 0.25)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  <CirclePlus className="size-4" />
                </button>

                <Select
                  value={zoom.toString()}
                  onValueChange={(value) => setZoom(Number(value))}
                >
                  <SelectTrigger className="h-7 rounded-sm w-24 bg-slate-800 border-slate-700 text-slate-300">
                    <SelectValue placeholder="Zoom">
                      {`${zoom * 100}%`}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-300">
                    {ZOOM_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option.toString()}>
                        {`${option * 100}%`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Separator orientation="vertical" className="bg-slate-700 h-4" />
                <Popover open={showSearch} onOpenChange={setShowSearch}>
                  <PopoverTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
                    <Search className="size-4" />
                  </PopoverTrigger>
                  <PopoverContent className="bg-slate-800 border-slate-700 w-64 p-3">
                    <Input
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-slate-200"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <ScrollArea className="h-16 grow w-full bg-slate-950">
              <div className="flex flex-row grow">
                <ScrollArea className="grow w-48" ref={viewportRef}>
                  <ScrollBar orientation="horizontal" />
                  <div className="items-center flex p-8 flex-col grow w-full">
                    {Array.from(new Array(numPages), (el, index) => (
                      <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        className="border border-slate-800 shadow-xs mb-8"
                        data-page-number={index + 1}
                        renderAnnotationLayer={false}
                        scale={zoom}
                        rotate={rotation}
                        loading={null}
                        customTextRenderer={searchQuery ? textRenderer : undefined}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </ScrollArea>
          </div>
        </div>
      </Document>
    </SidebarProvider>
  );
}

export { Component };
