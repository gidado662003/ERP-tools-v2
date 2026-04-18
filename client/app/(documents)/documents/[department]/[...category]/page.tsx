import React from "react";
import { Suspense } from "react";
import { CategoryPage } from "@/components/documents/CategoryPage";

function page() {
  return (
    <div>
      <Suspense>
        <CategoryPage />
      </Suspense>
    </div>
  );
}

export default page;
