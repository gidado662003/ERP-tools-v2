"use client";

import { useEffect, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import CreateCategoryModal from "./categoryModal";
import { internalRequestAPI } from "@/lib/internalRequestApi";

export type Category = {
  _id: string;
  name: string;
};

type CategoryProps = {
  onSelect: (category: Category) => void;
};

function Category({ onSelect }: CategoryProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await internalRequestAPI.categoryList(search);
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, reloadFlag]);

  const handleCategoryCreated = async (payload: {
    name: string;
    description: string;
  }) => {
    const newCategory = await internalRequestAPI.createCategory(payload);
    onSelect(newCategory);
    setSearch(newCategory.name);
    setModalOpen(false);
    setReloadFlag((prev) => !prev);
  };

  return (
    <>
      <Combobox<Category>
        items={categories}
        itemToStringValue={(category) => category?.name ?? ""}
        onValueChange={(category) => {
          if (category) {
            onSelect(category);
            setSearch(category.name);
          }
        }}
      >
        <ComboboxInput
          placeholder={loading ? "Loading..." : "Select category..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />

        <ComboboxContent className="w-[320px]">
          <ComboboxEmpty>
            <div className="flex flex-col gap-2 p-2">
              <p className="text-sm text-muted-foreground">
                No category found {search}
              </p>
              <button
                disabled
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 bg-[#3b5bdb] text-white rounded-md hover:bg-[#3451c7] transition-colors"
              >
                Create Category
              </button>
            </div>
          </ComboboxEmpty>

          <ComboboxList>
            {(category) => (
              <ComboboxItem key={category._id} value={category}>
                <span className="font-medium">{category.name}</span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {modalOpen && (
        <CreateCategoryModal
          onConfirm={handleCategoryCreated}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

export default Category;
