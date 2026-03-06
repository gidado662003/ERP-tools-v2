"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { documentsApi } from "@/lib/documentsApi";
import { DocumentCategory } from "@/lib/documentsTypes";

// Shadcn UI imports
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import {
  Folder,
  Trash2,
  RotateCcw,
  FileText,
  Search,
  ArrowUpDown,
  X,
} from "lucide-react";

// ─── Sort ─────────────────────────────────────────────────────────────────────

type SortKey =
  | "name-asc"
  | "name-desc"
  | "files-desc"
  | "files-asc"
  | "updated-desc"
  | "updated-asc";

const SORT_LABELS: Record<SortKey, string> = {
  "name-asc": "Name (A → Z)",
  "name-desc": "Name (Z → A)",
  "files-desc": "Most files",
  "files-asc": "Fewest files",
  "updated-desc": "Recently deleted",
  "updated-asc": "Oldest deleted",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function DeletedCategoriesPage() {
  const { department } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const query = searchParams.get("q") ?? "";
  const sort = (searchParams.get("sort") ?? "updated-desc") as SortKey;

  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const deptLabel = String(department).replace(/-/g, " ");

  // ── URL updater ────────────────────────────────────────────────────────────
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

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchDeleted = useCallback(async () => {
    setLoading(true);
    try {
      const data = await documentsApi.getDeletedCategories({ q: query, sort });
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch deleted categories:", error);
    } finally {
      setLoading(false);
    }
  }, [query, sort]);

  useEffect(() => {
    fetchDeleted();
  }, [fetchDeleted]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleRecover = async (cat: DocumentCategory) => {
    setActioningId(cat._id);
    try {
      await documentsApi.recoverCategory(cat._id);
      setCategories((prev) => prev.filter((c) => c._id !== cat._id));
    } catch (error) {
      console.error("Failed to recover category:", error);
    } finally {
      setActioningId(null);
    }
  };

  const handlePermanentDelete = async (cat: DocumentCategory) => {
    if (!confirm(`Permanently delete "${cat.name}"? This cannot be undone.`))
      return;
    setActioningId(cat._id);
    try {
      //   await documentsApi.permanentDeleteCategory(cat._id);
      setCategories((prev) => prev.filter((c) => c._id !== cat._id));
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 py-2">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-muted-foreground" />
            Deleted Categories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Recover or permanently delete categories
          </p>
        </div>

        <Separator className="mb-6" />

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search deleted categories…"
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
            {categories.length === 0
              ? `No deleted categories match "${query}"`
              : `${categories.length} ${categories.length === 1 ? "category" : "categories"} found`}
          </p>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                {query ? (
                  <Search className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <Trash2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-medium mb-1">
                {query ? "No results found" : "No deleted categories"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {query
                  ? `No deleted categories match "${query}"`
                  : "Deleted categories will appear here"}
              </p>
              {query && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setParam("q", "")}
                >
                  Clear search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => {
              const isActioning = actioningId === cat._id;
              return (
                <Card
                  key={cat._id}
                  className="opacity-75 hover:opacity-100 transition-opacity"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="rounded-lg p-2 bg-muted shrink-0">
                          <Folder className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium capitalize truncate">
                            {cat.name}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {cat.filesCount ?? 0}{" "}
                              {cat.filesCount === 1 ? "file" : "files"}
                            </span>
                            <span>•</span>
                            <span>
                              Deleted{" "}
                              {new Date(cat.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isActioning}
                          onClick={() => handleRecover(cat)}
                          className="gap-1.5"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Recover
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isActioning}
                          onClick={() => handlePermanentDelete(cat)}
                          className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
