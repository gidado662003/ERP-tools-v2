"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { documentsApi } from "@/lib/documentsApi";
import { DocumentFile } from "@/lib/documentsTypes";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getFileTypeInfo } from "@/lib/fileTypeInfo.tsx";
import CreateCategoryModal from "@/components/documents/CreateCategoryModal";
import {
  FileText,
  Upload,
  Download,
  X,
  ChevronLeft,
  Search,
  Folder,
  Loader2,
} from "lucide-react";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function CategoryPage() {
  const { department, category } = useParams();
  const slugArray = category as string[];
  const currentId = slugArray?.[slugArray.length - 1];
  const path = Array.isArray(category) ? category : category ? [category] : [];
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const query = searchParams.get("q") ?? "";

  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [catName, setCatName] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");

  const deptLabel = String(department).replace(/-/g, " ");
  const catLabel = catName || String(category).replace(/-/g, " ");

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      if (!currentId) return;
      const data = await documentsApi.getFilesByCategory(currentId, {
        q: query,
      });
      setFiles(data.documents ?? []);
      setFolders(data.folders ?? []);
      if (data.category?.name) setCatName(data.category.name);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setLoading(false);
    }
  }, [currentId, query]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setDisplayName(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleUpload = async () => {
    if (!selectedFile || !displayName.trim()) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("fileName", selectedFile.name);
    formData.append("name", displayName.trim());
    formData.append("category", String(currentId));
    try {
      await documentsApi.uploadFile(formData);
      await fetchFiles();
      handleCancel();
    } catch (error) {
      console.error("Failed to upload file:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setDisplayName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-2 py-2 ">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/documents">Documents</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/documents/${department}`}
                className="capitalize"
              >
                {deptLabel}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            <BreadcrumbPage className="capitalize font-semibold">
              {slugArray.map((_, index) => {
                const path = slugArray.slice(0, index + 1).join("/");
                return (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        key={path}
                        href={`/documents/${department}/${path}`}
                        className="capitalize"
                      >
                        {slugArray[index].replace(/-/g, " ")}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                );
              })}
            </BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href={`/documents/${department}`}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold capitalize">{catLabel}</h1>
              <p className="text-sm text-muted-foreground">
                {files.length} {files.length === 1 ? "file" : "files"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <CreateCategoryModal
              deptLabel={deptLabel}
              onCreated={fetchFiles}
              parentCategoryId={currentId as string}
              createCategory={(name) =>
                documentsApi.createCategory(name, currentId as string)
              }
              triggerLabel="New Folder"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            defaultValue={query}
            onChange={(e) => updateSearch(e.target.value)}
            className="pl-10 pr-10 h-11"
          />
          {query && (
            <button
              onClick={() => updateSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Upload Panel */}
        {selectedFile && (
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg border mb-6 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Input
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={uploading}
              className="mb-3"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading || !displayName.trim()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4">
                <Skeleton className="h-12 w-12 rounded-lg mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Folders */}
            {folders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Folders
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {folders.map((folder) => (
                    <Link
                      key={folder._id}
                      href={`/documents/${department}/${[...path, folder._id].join("/")}`}
                      className="group flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-slate-900 hover:border-primary hover:shadow-md transition-all"
                    >
                      <Folder className="h-5 w-5 text-primary" />
                      <span className="font-medium truncate">
                        {folder.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {files.length === 0 && folders.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                  {query ? (
                    <Search className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <p className="text-lg font-medium mb-2">
                  {query ? "No files found" : "Empty folder"}
                </p>
                <p className="text-muted-foreground mb-6">
                  {query
                    ? `No results for "${query}"`
                    : "Upload your first file to get started"}
                </p>
                {query ? (
                  <Button variant="outline" onClick={() => updateSearch("")}>
                    Clear search
                  </Button>
                ) : (
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload file
                  </Button>
                )}
              </div>
            ) : (
              files.length > 0 && (
                <div>
                  {folders.length > 0 && (
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Files
                    </h2>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {files.map((file) => {
                      const typeInfo = getFileTypeInfo(file.extension);
                      return (
                        <div
                          key={file._id}
                          className="group rounded-lg border bg-white dark:bg-slate-900 hover:border-primary hover:shadow-md transition-all overflow-hidden"
                        >
                          <Link
                            href={`/documents/${department}/${category}/${file._id}`}
                            className="block p-4"
                          >
                            <div
                              className={`inline-flex p-2 rounded-lg mb-3 ${typeInfo.color}`}
                            >
                              {typeInfo.icon}
                            </div>
                            <p className="font-medium truncate mb-2 group-hover:text-primary transition-colors">
                              {file.name}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {file.extension}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(file.fileSize)}
                              </span>
                            </div>
                          </Link>
                          <div className="border-t px-4 py-2 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <span className="text-xs text-muted-foreground">
                              {new Date(file.createdAt).toLocaleDateString()}
                            </span>
                            <a
                              href={`/api/documents/download/${file._id}`}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
