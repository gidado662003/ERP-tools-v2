"use client";
import { useState, useCallback, useTransition, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { documentsApi } from "@/lib/documentsApi";
import { DocumentCategory } from "@/lib/documentsTypes";
import CreateCategoryModal from "@/components/documents/CreateCategoryModal";
import UpdateCategoryModal from "@/components/documents/updateCategoryModal";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store";
import {
  Folder,
  FileText,
  Clock,
  Search,
  ArrowUpDown,
  X,
  Trash,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = "files-desc" | "files-asc" | "updated-desc" | "updated-asc";

const SORT_LABELS: Record<SortKey, string> = {
  "files-desc": "Most files",
  "files-asc": "Fewest files",
  "updated-desc": "Recently updated",
  "updated-asc": "Oldest updated",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function DepartmentPage() {
  const { department } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const user = useAuthStore((state) => state.user);

  const query = searchParams.get("q") ?? "";
  const sort = (searchParams.get("sort") ?? "updated-desc") as SortKey;
  const view = (searchParams.get("view") ?? "grid") as "grid" | "list";

  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deptLabel = String(department).replace(/-/g, " ");

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

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await documentsApi.getCategories({ q: query, sort });
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }, [query, sort]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await documentsApi.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const totalFiles = categories.reduce(
    (acc, cat) => acc + (cat.filesCount ?? 0),
    0,
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/documents">Documents</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">
                  {deptLabel}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight capitalize">
                {deptLabel}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                {totalFiles} {totalFiles === 1 ? "file" : "files"} ·{" "}
                {categories.length} categories
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1 gap-0.5">
                <Button
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setParam("view", "grid")}
                  className="h-7 w-7 p-0"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setParam("view", "list")}
                  className="h-7 w-7 p-0"
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
              </div>

              <CreateCategoryModal
                deptLabel={deptLabel}
                onCreated={fetchCategories}
                createCategory={(name) => documentsApi.createCategory(name)}
              />
            </div>
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search categories…"
                defaultValue={query}
                onChange={(e) => setParam("q", e.target.value)}
                className="pl-9 pr-9"
              />
              {query && (
                <button
                  onClick={() => setParam("q", "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
              <DropdownMenuContent align="end" className="w-48">
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
                ? `No categories match "${query}"`
                : `${categories.length} ${categories.length === 1 ? "category" : "categories"} found`}
            </p>
          )}

          <Separator className="mb-6" />

          {/* Loading */}
          {loading ? (
            view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <Skeleton className="h-10 w-10 rounded-xl mb-4" />
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : categories.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-muted p-5 mb-4">
                  {query ? (
                    <Search className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <Folder className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-semibold mb-1">
                  {query ? "No results found" : "No categories yet"}
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-5 max-w-xs">
                  {query
                    ? `No categories match "${query}"`
                    : "Create your first category to start organizing documents."}
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
                  <CreateCategoryModal
                    deptLabel={deptLabel}
                    onCreated={fetchCategories}
                    createCategory={(name) => documentsApi.createCategory(name)}
                  />
                )}
              </CardContent>
            </Card>
          ) : view === "grid" ? (
            /* ── Grid ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Card
                  key={cat._id}
                  className="group relative flex flex-col hover:shadow-md hover:border-primary/30 transition-all duration-200"
                >
                  {/* Actions */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <UpdateCategoryModal
                      deptLabel={cat.name}
                      onCreated={fetchCategories}
                      createCategory={(name) =>
                        documentsApi.renameCategory(name, cat._id)
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingId === cat._id}
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete "{cat.name}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will move the category to the bin. You can
                            recover it later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => handleDelete(cat._id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <CardContent className="p-5 flex-1">
                    <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3 border border-amber-100 dark:border-amber-900/30">
                      <Folder className="h-6 w-6 text-amber-500 fill-amber-500/20" />
                    </div>
                    <h3 className="font-semibold capitalize truncate mb-2 group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {cat.filesCount ?? 0}{" "}
                        {cat.filesCount === 1 ? "file" : "files"}
                      </span>
                      {cat.updatedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(cat.updatedAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="p-0 border-t">
                    <Link
                      href={`/documents/${department}/${cat._id}`}
                      className="flex items-center justify-between w-full px-5 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                    >
                      <span className="text-xs font-medium">
                        {user?.role === "admin"
                          ? cat.department
                          : "Open folder"}
                      </span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            /* ── List ── */
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <div key={cat._id} className="group flex items-center gap-3">
                  <Link
                    href={`/documents/${department}/${cat._id}`}
                    className="flex-1 min-w-0"
                  >
                    <Card className="hover:border-primary/30 hover:bg-muted/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 shrink-0">
                            <Folder className="h-4 w-4 text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium capitalize truncate text-sm">
                              {cat.name}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span>{cat.filesCount ?? 0} files</span>
                              {cat.updatedAt && (
                                <>
                                  <span>·</span>
                                  <span>
                                    Updated{" "}
                                    {new Date(
                                      cat.updatedAt,
                                    ).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  {/* List row actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <UpdateCategoryModal
                      deptLabel={cat.name}
                      onCreated={fetchCategories}
                      createCategory={(name) =>
                        documentsApi.renameCategory(name, cat._id)
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingId === cat._id}
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete "{cat.name}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will move the category to the bin. You can
                            recover it later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => handleDelete(cat._id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
