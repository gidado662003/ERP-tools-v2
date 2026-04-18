"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface CreateCategoryModalProps {
  deptLabel: string;
  onCreated: () => void;
  createCategory: (name: string, parentCategoryId?: string) => Promise<void>;
  parentCategoryId?: string;
  triggerLabel?: string;
}

export default function CreateCategoryModal({
  deptLabel,
  onCreated,
  createCategory,
  parentCategoryId,
  triggerLabel = "New Category",
}: CreateCategoryModalProps) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const isFolder = !!parentCategoryId;

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createCategory(newName);
      onCreated();
      setOpen(false);
      setNewName("");
    } catch (error) {
      console.error("Failed to create:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isFolder ? "Create New Folder" : "Create New Category"}
          </DialogTitle>
          <DialogDescription>
            {isFolder
              ? `Add a new folder to organise files in ${deptLabel}.`
              : `Add a new category to organise your documents in ${deptLabel}.`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            autoFocus
            placeholder={
              isFolder
                ? "e.g., Archive, Templates..."
                : "e.g., Quarterly Reports, Team Documents..."
            }
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            disabled={creating}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
            {creating && (
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
            )}
            {isFolder ? "Create Folder" : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
