"use client";
import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { documentsApi } from "@/lib/documentsApi";
import { DocumentFile } from "@/lib/documentsTypes";

// Shadcn UI imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getFileTypeInfo } from "@/lib/fileTypeInfo.tsx";

// Icons
import {
  FileText,
  Upload,
  Download,
  X,
  ChevronLeft,
  Search,
  ArrowUpDown,
} from "lucide-react";

// ─── File type helper ─────────────────────────────────────────────────────────

type SortKey =
  | "name-asc"
  | "name-desc"
  | "size-desc"
  | "size-asc"
  | "updated-desc"
  | "updated-asc";

const SORT_LABELS: Record<SortKey, string> = {
  "name-asc": "Name (A → Z)",
  "name-desc": "Name (Z → A)",
  "size-desc": "Largest first",
  "size-asc": "Smallest first",
  "updated-desc": "Recently uploaded",
  "updated-asc": "Oldest first",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function CategoryPage() {
  const { department, category } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const query = searchParams.get("q") ?? "";
  const sort = (searchParams.get("sort") ?? "updated-desc") as SortKey;

  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [fileName, setFileName] = useState("");

  const deptLabel = String(department).replace(/-/g, " ");
  const catLabel =
    files[0]?.category && typeof files[0].category === "object"
      ? files[0].category.name
      : String(category).replace(/-/g, " ");

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      startTransition(() => {
        router.replace(`?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams],
  );

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      if (!category) return;
      const data = await documentsApi.getFilesByCategory(category, {
        q: query,
        sort,
      });
      setFiles(data);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setLoading(false);
    }
  }, [category, query, sort]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const nameWithoutExt = file.name.replace(/\.[^.]+$/, "");
    setDisplayName(nameWithoutExt);
    setFileName(nameWithoutExt);
  };

  const handleUpload = async () => {
    if (!selectedFile || !displayName.trim() || !fileName.trim()) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", displayName.trim());
    formData.append("fileName", fileName.trim());
    formData.append("category", String(category));
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
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
            <BreadcrumbItem>
              <BreadcrumbPage className="capitalize">{catLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold capitalize flex items-center gap-2">
              <Link
                href={`/documents/${department}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              {catLabel}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {files.length} {files.length === 1 ? "file" : "files"}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>

        <Separator className="mb-6" />

        {/* Upload card */}
        {selectedFile && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-lg p-2 bg-primary/10 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={uploading}
                  className="shrink-0 ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="space-y-1.5">
                  <Label htmlFor="display-name" className="text-xs">
                    Display Name
                  </Label>
                  <Input
                    id="display-name"
                    placeholder="e.g. Q1 Report"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={uploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    How the file appears in the list
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="file-name" className="text-xs">
                    File Name
                  </Label>
                  <Input
                    id="file-name"
                    placeholder="e.g. q1-report"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    disabled={uploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for storage reference
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={
                    uploading || !displayName.trim() || !fileName.trim()
                  }
                >
                  {uploading ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Confirm Upload
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search files…"
              defaultValue={query}
              onChange={(e) => setParam("q", e.target.value)}
              className="pl-9 pr-9"
            />
            {query && (
              <button
                onClick={() => setParam("q", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">{SORT_LABELS[sort]}</span>
                <span className="sm:hidden">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuRadioGroup
                value={sort}
                onValueChange={(v) => setParam("sort", v)}
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {SORT_LABELS[key]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {query && !loading && (
          <p className="text-sm text-muted-foreground mb-4">
            {files.length === 0
              ? `No files match "${query}"`
              : `${files.length} ${files.length === 1 ? "file" : "files"} found`}
          </p>
        )}

        {/* File grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-12 w-12 rounded-xl mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : files.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                {query ? (
                  <Search className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <FileText className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-medium mb-2">
                {query ? "No files found" : "No files yet"}
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                {query
                  ? `No files match "${query}"`
                  : "Upload your first file to get started"}
              </p>
              {query ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setParam("q", "")}
                >
                  Clear search
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {files.map((file) => {
              const typeInfo = getFileTypeInfo(file.extension);
              return (
                <Link
                  key={file._id}
                  href={`/documents/${department}/${category}/${file._id}`}
                  className="block group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
                >
                  <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all duration-200 overflow-hidden">
                    <CardContent className="p-4 pb-3">
                      <div
                        className={`rounded-xl p-3 w-fit mb-3 ${typeInfo.color}`}
                      >
                        {typeInfo.icon} {file.extension}
                      </div>
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors mb-1">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.fileSize)}
                      </p>
                    </CardContent>
                    <CardFooter className="px-4 py-2 flex items-center justify-between border-t bg-muted/30">
                      <span className="text-xs text-muted-foreground">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </span>
                      <a
                        href={`/api/documents/download/${file._id}`}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        aria-label="Download"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
