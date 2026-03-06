import React from "react";
import { Suspense } from "react";
import { DeletedCategoriesPage } from "@/components/documents/DeletedCategoriesPage";

function page() {
  return (
    <div>
      <Suspense>
        <DeletedCategoriesPage />
      </Suspense>
    </div>
  );
}

export default page;
