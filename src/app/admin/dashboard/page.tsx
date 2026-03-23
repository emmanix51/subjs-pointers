"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Trash2, Image, FileText, LogOut, Plus, Edit2, X, BookOpen, Check } from "lucide-react";

const terms = [
  { slug: "prelim", title: "Prelim" },
  { slug: "midterm", title: "Midterm" },
  { slug: "semifinal", title: "Semifinal" },
  { slug: "finals", title: "Finals" },
];

interface Subject {
  slug: string;
  title: string;
  description: string;
}

interface UploadedFile {
  url: string;
  name: string;
  type: "pictures" | "pdfs";
}

type Tab = "subjects" | "files";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("subjects");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState(terms[0].slug);
  const [selectedType, setSelectedType] = useState<"pictures" | "pdfs">("pictures");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [draggedFile, setDraggedFile] = useState<File | null>(null);
  
  // Subject form state
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectTitle, setSubjectTitle] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/admin/check");
      if (!res.ok) {
        router.push("/admin");
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadFiles();
    }
  }, [selectedSubject, selectedTerm]);

  const loadSubjects = async () => {
    try {
      const res = await fetch("/api/subjects?" + Date.now(), { cache: "no-store" });
      const data = await res.json();
      setSubjects(data);
      if (data.length > 0 && !selectedSubject) {
        setSelectedSubject(data[0].slug);
      }
    } catch {
      setSubjects([]);
    }
  };

  const loadFiles = async () => {
    try {
      const picsRes = await fetch(`/api/files?subject=${selectedSubject}&term=${selectedTerm}&type=pictures`);
      const pdfsRes = await fetch(`/api/files?subject=${selectedSubject}&term=${selectedTerm}&type=pdfs`);
      
      const pics = await picsRes.json();
      const pdfs = await pdfsRes.json();
      
      setFiles([
        ...pics.map((url: string) => ({ url, name: url.split("/").pop() || "", type: "pictures" as const })),
        ...pdfs.map((url: string) => ({ url, name: url.split("/").pop() || "", type: "pdfs" as const })),
      ]);
    } catch {
      setFiles([]);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = "/api/subjects";
    const method = editingSubject ? "PUT" : "POST";
    const body = editingSubject 
      ? { slug: editingSubject.slug, title: subjectTitle, description: subjectDescription }
      : { title: subjectTitle, description: subjectDescription };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      await loadSubjects();
      resetForm();
      if (!editingSubject && data.slug) {
        setSelectedSubject(data.slug);
      }
    } else {
      alert(data.error || "Failed to save subject");
    }
  };

  const handleDeleteSubject = async (slug: string) => {
    if (!confirm("Delete this subject? All associated files will remain but won't be accessible.")) return;
    
    const res = await fetch(`/api/subjects?slug=${slug}`, { method: "DELETE" });
    if (res.ok) {
      loadSubjects();
      if (selectedSubject === slug && subjects.length > 1) {
        setSelectedSubject(subjects.find(s => s.slug !== slug)?.slug || "");
      }
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectTitle(subject.title);
    setSubjectDescription(subject.description);
    setShowSubjectForm(true);
  };

  const resetForm = () => {
    setShowSubjectForm(false);
    setEditingSubject(null);
    setSubjectTitle("");
    setSubjectDescription("");
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subject", selectedSubject);
      formData.append("term", selectedTerm);
      formData.append("type", selectedType);
      formData.append("fileName", file.name);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      return res.json();
    });

    await Promise.all(uploadPromises);
    setUploading(false);
    loadFiles();
  };

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    await uploadFiles(files);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (selectedType !== "pictures") return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            const timestamp = Date.now();
            const ext = item.type.split("/")[1] || "png";
            const newFile = new File([file], `pasted-image-${timestamp}.${ext}`, { type: item.type });
            uploadFiles([newFile]);
            break;
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [selectedType, selectedSubject, selectedTerm]);

  const handleDeleteFile = async (url: string) => {
    const filePath = url.replace("/", "");
    await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath }),
    });
    loadFiles();
  };

  const filteredFiles = files.filter((f) => f.type === selectedType);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-200 mb-2">Admin Dashboard</h1>
          <p className="text-slate-500">Manage subjects and upload files</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-800">
          <button
            onClick={() => setActiveTab("subjects")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "subjects"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Subjects
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === "files"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-5 h-5" />
            Upload Files
          </button>
        </div>

        {/* Subjects Tab */}
        {activeTab === "subjects" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowSubjectForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Subject
              </button>
            </div>

            {/* Add/Edit Form Modal */}
            {showSubjectForm && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-200">
                      {editingSubject ? "Edit Subject" : "Add New Subject"}
                    </h3>
                    <button
                      onClick={resetForm}
                      className="text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSubjectSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
                      <input
                        type="text"
                        value={subjectTitle}
                        onChange={(e) => setSubjectTitle(e.target.value)}
                        placeholder="e.g., CC102"
                        required
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                      <textarea
                        value={subjectDescription}
                        onChange={(e) => setSubjectDescription(e.target.value)}
                        placeholder="Enter subject description..."
                        required
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors cursor-pointer"
                      >
                        {editingSubject ? "Save Changes" : "Add Subject"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Subjects List */}
            {subjects.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No subjects yet. Click "Add Subject" to create one.
              </div>
            ) : (
              <div className="space-y-3">
                {subjects.map((subject) => (
                  <div
                    key={subject.slug}
                    className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-200">{subject.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{subject.description}</p>
                        <p className="text-xs text-slate-600 mt-2">Slug: {subject.slug}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditSubject(subject)}
                          className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subject.slug)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Files Tab */}
        {activeTab === "files" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {subjects.map((s) => (
                    <option key={s.slug} value={s.slug}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Term</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {terms.map((t) => (
                    <option key={t.slug} value={t.slug}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">File Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedType("pictures")}
                    className={`flex-1 py-3 rounded-lg border transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                      selectedType === "pictures"
                        ? "border-sky-500 bg-sky-500/10 text-sky-400"
                        : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <Image className="w-4 h-4" />
                    Pictures
                  </button>
                  <button
                    onClick={() => setSelectedType("pdfs")}
                    className={`flex-1 py-3 rounded-lg border transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                      selectedType === "pdfs"
                        ? "border-sky-500 bg-sky-500/10 text-sky-400"
                        : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    PDFs
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-6 ${
                  draggedFile
                    ? "border-sky-500 bg-sky-500/5"
                    : "border-slate-700 hover:border-slate-500"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDraggedFile(e.dataTransfer.files[0] || null);
                }}
                onDragLeave={() => setDraggedFile(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDraggedFile(null);
                  handleFileUpload(e.dataTransfer.files);
                }}
              >
                <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">
                  Drag and drop files here, or
                </p>
                <label className="inline-block cursor-pointer">
                  <span className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors cursor-pointer">
                    Browse Files
                  </span>
                  <input
                    type="file"
                    multiple
                    accept={selectedType === "pictures" ? "image/*" : ".pdf"}
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-slate-500 mt-2">
                  {selectedType === "pictures" ? "Supports: JPG, PNG, GIF, WebP" : "Supports: PDF files"}
                </p>
              </div>

              {uploading && (
                <div className="flex items-center justify-center gap-2 text-sky-400 mb-4">
                  <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-200">
                  {selectedType === "pictures" ? "Pictures" : "PDFs"} ({filteredFiles.length})
                </h3>
              </div>

              {filteredFiles.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No {selectedType} uploaded yet
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredFiles.map((file) => (
                    <div key={file.url} className="relative group">
                      {selectedType === "pictures" ? (
                        <div className="aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square rounded-lg border border-slate-700 bg-slate-800 flex flex-col items-center justify-center p-4">
                          <FileText className="w-12 h-12 text-sky-400 mb-2" />
                          <p className="text-xs text-slate-400 text-center truncate w-full">
                            {file.name}
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteFile(file.url)}
                        className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
